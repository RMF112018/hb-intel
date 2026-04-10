import fs from 'node:fs/promises';

function toDosDateTime(value: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, value.getUTCFullYear());
  const month = value.getUTCMonth() + 1;
  const day = value.getUTCDate();
  const hours = value.getUTCHours();
  const minutes = value.getUTCMinutes();
  const seconds = Math.floor(value.getUTCSeconds() / 2);
  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { dosTime, dosDate };
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function buildZipFromFiles(entries: readonly { fileName: string; filePath: string }[], outputPath: string): Promise<void> {
  type Entry = {
    nameBytes: Buffer;
    dataBytes: Buffer;
    crc: number;
    offset: number;
    dosTime: number;
    dosDate: number;
  };

  const now = toDosDateTime(new Date());
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const built: Entry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const dataBytes = await fs.readFile(entry.filePath);
    const nameBytes = Buffer.from(entry.fileName, 'utf-8');
    const crc = crc32(dataBytes);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(now.dosTime, 10);
    localHeader.writeUInt16LE(now.dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(dataBytes.length, 18);
    localHeader.writeUInt32LE(dataBytes.length, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBytes, dataBytes);
    built.push({ nameBytes, dataBytes, crc, offset, dosTime: now.dosTime, dosDate: now.dosDate });
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  }

  let centralSize = 0;
  for (const entry of built) {
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(entry.dosTime, 12);
    centralHeader.writeUInt16LE(entry.dosDate, 14);
    centralHeader.writeUInt32LE(entry.crc, 16);
    centralHeader.writeUInt32LE(entry.dataBytes.length, 20);
    centralHeader.writeUInt32LE(entry.dataBytes.length, 24);
    centralHeader.writeUInt16LE(entry.nameBytes.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(entry.offset, 42);
    centralParts.push(centralHeader, entry.nameBytes);
    centralSize += centralHeader.length + entry.nameBytes.length;
  }

  const centralOffset = offset;
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(built.length, 8);
  endRecord.writeUInt16LE(built.length, 10);
  endRecord.writeUInt32LE(centralSize, 12);
  endRecord.writeUInt32LE(centralOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  const zip = Buffer.concat([...localParts, ...centralParts, endRecord]);
  await fs.writeFile(outputPath, zip);
}
