function returnBase(number, base) {
	var convert = [
			'0',
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G',
			'H',
			'I',
			'J',
			'K',
			'L',
			'M',
			'N',
			'O',
			'P',
			'Q',
			'R',
			'S',
			'T',
			'U',
			'V',
			'W',
			'X',
			'Y',
			'Z'];
	if (number < base)
		var output = convert[number];
	else {
		var MSD = '' + Math.floor(number / base);
		var LSD = number - MSD * base;
		if (MSD >= base)
			var output = returnBase(MSD, base) + convert[LSD];
		else
			var output = convert[MSD] + convert[LSD];
	}
	return output;
}

function getIntegerBits(val, start, end) {
	var base16 = returnBase(val, 16);
	var quadArray = new Array();
	var quadString = '';
	var i = 0;
	for (i = 0; i < base16.length; i++) {
		quadArray.push(base16.substring(i, i + 1));
	}
	for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
		if (!quadArray[i] || quadArray[i] == '')
			quadString += '0';
		else
			quadString += quadArray[i];
	}
	return quadString;
};

function rand(max) {
	return Math.floor(Math.random() * max);
};

function createUUID() {

	var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	var dc = new Date( currentTime );
	var t = dc.getTime() - dg.getTime();
	var h = '-';
	var tl = getIntegerBits(t, 0, 31);
	var tm = getIntegerBits(t, 32, 47);
	var thv = getIntegerBits(t, 48, 59) + '1'; // version 1, security version is 2
	var csar = getIntegerBits(rand(4095), 0, 7);
	var csl = getIntegerBits(rand(4095), 0, 7);

	// since detection of anything about the machine/browser is far to buggy,
	// include some more random numbers here
	// if NIC or an IP can be obtained reliably, that should be put in
	// here instead.
	var n = getIntegerBits(rand(8191), 0, 7) + getIntegerBits(rand(8191), 8, 15) + getIntegerBits(rand(8191), 0, 7)
			+ getIntegerBits(rand(8191), 8, 15) + getIntegerBits(rand(8191), 0, 15); // this last number is two
	// octets long
	return tl + h + tm + h + thv + h + csar + csl + h + n;

};
define(function(){});