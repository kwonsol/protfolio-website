const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
globalThis.crypto ||= webcrypto;
require('../crypto.js');
const password='test-only-passphrase-2026';
const value={title:'비공개 테스트',images:['data:image/png;base64,dGVzdA==']};
test('encrypted content round trips, with independent salt and nonce',async()=>{
 const a=await PortfolioCrypto.seal(value,password), b=await PortfolioCrypto.seal(value,password);
 assert.deepEqual(await PortfolioCrypto.open(a,password),value);
 assert.notEqual(a.salt,b.salt);assert.notEqual(a.iv,b.iv);assert.notEqual(a.data,b.data);
 assert.ok(!JSON.stringify(a).includes(value.title));assert.ok(!JSON.stringify(a).includes(password));
});
test('wrong passwords and modified ciphertext are rejected',async()=>{
 const a=await PortfolioCrypto.seal(value,password);
 await assert.rejects(PortfolioCrypto.open(a,'incorrect-passphrase'));
 const bytes=Buffer.from(a.data,'base64');bytes[0]^=1;
 await assert.rejects(PortfolioCrypto.open({...a,data:bytes.toString('base64')},password));
});
test('whole-site encryption preserves independently locked projects',async()=>{
 const p=await PortfolioCrypto.seal(value,password);
 const site=await PortfolioCrypto.seal({projects:[{payload:p}]},'different-site-passphrase');
 const opened=await PortfolioCrypto.open(site,'different-site-passphrase');
 await assert.rejects(PortfolioCrypto.open(opened.projects[0].payload,'different-site-passphrase'));
 assert.deepEqual(await PortfolioCrypto.open(opened.projects[0].payload,password),value);
 await assert.rejects(PortfolioCrypto.seal(value,'short'));
});
