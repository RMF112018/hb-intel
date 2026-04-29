import { mount } from './mount';

const host = document.getElementById('pcc-preview-root');
if (!host) {
  throw new Error('PCC preview host element #pcc-preview-root is missing');
}
mount(host);
