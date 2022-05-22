import test from 'ava';

import { createFilesystem } from './filesystems';

test('createFilesystem', async (t) => {
  const fs = createFilesystem('./tmp-server-fs');

  t.is(fs.exists('server.properties'), false);
});
