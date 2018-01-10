/*
    Foundry.trace.js part of the FoundryJS project
    Copyright (C) 2012 Steve Strong  http://foundryjs.azurewebsites.net/

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Foundry = Foundry || {};

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FOperators%2FBitwise_Operators#Flags_and_bitmasks
(function (ns, undefined) {

	const FLAG_A = 1; // 0001
	const FLAG_B = 2; // 0010
	const FLAG_C = 4; // 0100
	const FLAG_D = 8; // 1000


	var mask = FLAG_A | FLAG_B | FLAG_D; // 0001 | 0010 | 1000 => 1011


	function createMask() {
		var nMask = 0, nFlag = 0, nLen = arguments.length > 32 ? 32 : arguments.length;
		for (nFlag; nFlag < nLen; nMask |= arguments[nFlag] << nFlag++);
		return nMask;
	}
	var mask1 = createMask(true, true, false, true); // 11, i.e.: 1011
	var mask2 = createMask(false, false, true); // 4, i.e.: 0100
	var mask3 = createMask(true); // 1, i.e.: 0001

	function createBinaryString(nMask) {
		// nMask must be between -2147483648 and 2147483647
		for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
			 nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
		return sMask;
	}

	function arrayFromMask(nMask) {
		// nMask must be between -2147483648 and 2147483647
		if (nMask > 0x7fffffff || nMask < -0x80000000) {
			throw new TypeError("arrayFromMask - out of range");
		}
		for (var nShifted = nMask, aFromMask = []; nShifted;
			 aFromMask.push(Boolean(nShifted & 1)), nShifted >>>= 1);
		return aFromMask;
	}

	var array1 = arrayFromMask(11);
	var array2 = arrayFromMask(4);
	var array3 = arrayFromMask(1);

}(Foundry));