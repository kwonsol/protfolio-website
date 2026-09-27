/* Shared by the viewer and the local publishing tool. No passwords are stored. */
(() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const encode = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
  const decode = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
  async function key(password, salt, usage) {
    if (!globalThis.crypto?.subtle) throw new Error('HTTPS 또는 localhost에서 열어 주세요.');
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:600000, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, [usage]);
  }
  globalThis.PortfolioCrypto = {
    async seal(value, password) {
      if (password.length < 12) throw new Error('비밀번호는 12자 이상 입력해 주세요.');
      const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM', iv}, await key(password, salt, 'encrypt'), enc.encode(JSON.stringify(value)));
      return {encrypted:true, version:1, salt:encode(salt), iv:encode(iv), data:encode(new Uint8Array(ciphertext))};
    },
    async open(value, password) {
      if (value.version !== 1) throw new Error('지원하지 않는 파일입니다.');
      const raw = await crypto.subtle.decrypt({name:'AES-GCM', iv:decode(value.iv)}, await key(password, decode(value.salt), 'decrypt'), decode(value.data));
      return JSON.parse(dec.decode(raw));
    }
  };
})();
