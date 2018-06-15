export class foBitwise {
  //let mask = FLAG_A | FLAG_B | FLAG_D; // 0001 | 0010 | 1000 => 1011

  createMask(...arg) {
    let nMask = 0,
      nFlag = 0;
    const nLen = arguments.length > 32 ? 32 : arguments.length;
    for (nFlag; nFlag < nLen; nMask |= arguments[nFlag] << nFlag++) { }
    return nMask;
  }

  createBinaryString(nMask) {
    let sMask;
    // nMask must be between -2147483648 and 2147483647
    for (
      let nFlag = 0, nShifted = nMask, sMask = '';
      nFlag < 32;
      nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1
    ) { }
    return sMask;
  }

  arrayFromMask(nMask) {
    let aFromMask;
    // nMask must be between -2147483648 and 2147483647
    if (nMask > 0x7fffffff || nMask < -0x80000000) {
      throw new TypeError('arrayFromMask - out of range');
    }
    for (
      let nShifted = nMask, aFromMask = [];
      nShifted;
      aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1
    ) {; }
    return aFromMask;
  }

  example() {
    const FLAG_A = 1; // 0001
    const FLAG_B = 2; // 0010
    const FLAG_C = 4; // 0100
    const FLAG_D = 8; // 1000

    const mask1 = this.createMask(true, true, false, true); // 11, i.e.: 1011
    const mask2 = this.createMask(false, false, true); // 4, i.e.: 0100
    const mask3 = this.createMask(true); // 1, i.e.: 0001

    const array1 = this.arrayFromMask(11);
    const array2 = this.arrayFromMask(4);
    const array3 = this.arrayFromMask(1);
  }
}
