/*---------------------------------------------------------------------------------------------
 *  Generated by Peggy 1.2.0.
 *  https://peggyjs.org/
 *--------------------------------------------------------------------------------------------*/

'use strict';

function peg$subclass(child, parent) {
	function C() {
		this.constructor = child;
	}
	C.prototype = parent.prototype;
	child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
	var self = Error.call(this, message);
	if (Object.setPrototypeOf) {
		Object.setPrototypeOf(self, peg$SyntaxError.prototype);
	}
	self.expected = expected;
	self.found = found;
	self.location = location;
	self.name = 'SyntaxError';
	return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
	padString = padString || ' ';
	if (str.length > targetLength) {
		return str;
	}
	targetLength -= str.length;
	padString += padString.repeat(targetLength);
	return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function (sources) {
	var str = 'Error: ' + this.message;
	if (this.location) {
		var src = null;
		var k;
		for (k = 0; k < sources.length; k++) {
			if (sources[k].source === this.location.source) {
				src = sources[k].text.split(/\r\n|\n|\r/g);
				break;
			}
		}
		var s = this.location.start;
		var loc = this.location.source + ':' + s.line + ':' + s.column;
		if (src) {
			var e = this.location.end;
			var filler = peg$padEnd('', s.line.toString().length);
			var line = src[s.line - 1];
			var last = s.line === e.line ? e.column : line.length + 1;
			str +=
				'\n --> ' +
				loc +
				'\n' +
				filler +
				' |\n' +
				s.line +
				' | ' +
				line +
				'\n' +
				filler +
				' | ' +
				peg$padEnd('', s.column - 1) +
				peg$padEnd('', last - s.column, '^');
		} else {
			str += '\n at ' + loc;
		}
	}
	return str;
};

peg$SyntaxError.buildMessage = function (expected, found) {
	var DESCRIBE_EXPECTATION_FNS = {
		literal: function (expectation) {
			return '"' + literalEscape(expectation.text) + '"';
		},

		class: function (expectation) {
			var escapedParts = expectation.parts.map(function (part) {
				return Array.isArray(part) ? classEscape(part[0]) + '-' + classEscape(part[1]) : classEscape(part);
			});

			return '[' + (expectation.inverted ? '^' : '') + escapedParts + ']';
		},

		any: function () {
			return 'any character';
		},

		end: function () {
			return 'end of input';
		},

		other: function (expectation) {
			return expectation.description;
		},
	};

	function hex(ch) {
		return ch.charCodeAt(0).toString(16).toUpperCase();
	}

	function literalEscape(s) {
		return s
			.replace(/\\/g, '\\\\')
			.replace(/"/g, '\\"')
			.replace(/\0/g, '\\0')
			.replace(/\t/g, '\\t')
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/[\x00-\x0F]/g, function (ch) {
				return '\\x0' + hex(ch);
			})
			.replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
				return '\\x' + hex(ch);
			});
	}

	function classEscape(s) {
		return s
			.replace(/\\/g, '\\\\')
			.replace(/\]/g, '\\]')
			.replace(/\^/g, '\\^')
			.replace(/-/g, '\\-')
			.replace(/\0/g, '\\0')
			.replace(/\t/g, '\\t')
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/[\x00-\x0F]/g, function (ch) {
				return '\\x0' + hex(ch);
			})
			.replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
				return '\\x' + hex(ch);
			});
	}

	function describeExpectation(expectation) {
		return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
	}

	function describeExpected(expected) {
		var descriptions = expected.map(describeExpectation);
		var i, j;

		descriptions.sort();

		if (descriptions.length > 0) {
			for (i = 1, j = 1; i < descriptions.length; i++) {
				if (descriptions[i - 1] !== descriptions[i]) {
					descriptions[j] = descriptions[i];
					j++;
				}
			}
			descriptions.length = j;
		}

		switch (descriptions.length) {
			case 1:
				return descriptions[0];

			case 2:
				return descriptions[0] + ' or ' + descriptions[1];

			default:
				return descriptions.slice(0, -1).join(', ') + ', or ' + descriptions[descriptions.length - 1];
		}
	}

	function describeFound(found) {
		return found ? '"' + literalEscape(found) + '"' : 'end of input';
	}

	return 'Expected ' + describeExpected(expected) + ' but ' + describeFound(found) + ' found.';
};

function peg$parse(input, options) {
	options = options !== undefined ? options : {};

	var peg$FAILED = {};
	var peg$source = options.grammarSource;

	var peg$startRuleFunctions = { start: peg$parsestart };
	var peg$startRuleFunction = peg$parsestart;

	var peg$c0 = '.';
	var peg$c1 = ':';
	var peg$c2 = '(';
	var peg$c3 = ')';
	var peg$c4 = '-';
	var peg$c5 = ',';

	var peg$r0 = /^[a-zA-Z0-9+_]/;
	var peg$r1 = /^[a-zA-Z0-9\-+_]/;
	var peg$r2 = /^[*]/;
	var peg$r3 = /^[LRB]/;
	var peg$r4 = /^[|&\-]/;
	var peg$r5 = /^[ \t]/;

	var peg$e0 = peg$classExpectation([['a', 'z'], ['A', 'Z'], ['0', '9'], '+', '_'], false, false);
	var peg$e1 = peg$classExpectation([['a', 'z'], ['A', 'Z'], ['0', '9'], '-', '+', '_'], false, false);
	var peg$e2 = peg$classExpectation(['*'], false, false);
	var peg$e3 = peg$literalExpectation('.', false);
	var peg$e4 = peg$classExpectation(['L', 'R', 'B'], false, false);
	var peg$e5 = peg$literalExpectation(':', false);
	var peg$e6 = peg$literalExpectation('(', false);
	var peg$e7 = peg$literalExpectation(')', false);
	var peg$e8 = peg$literalExpectation('-', false);
	var peg$e9 = peg$classExpectation(['|', '&', '-'], false, false);
	var peg$e10 = peg$literalExpectation(',', false);
	var peg$e11 = peg$classExpectation([' ', '\t'], false, false);

	var peg$f0 = function (selector) {
		return selector;
	};
	var peg$f1 = function (segment) {
		return new matchers.SegmentMatcher(segment);
	};
	var peg$f2 = function (scopeName) {
		return new matchers.TrueMatcher();
	};
	var peg$f3 = function (first, others) {
		return new matchers.ScopeMatcher(first, others);
	};
	var peg$f4 = function (prefix, first, others) {
		return new matchers.PathMatcher(prefix, first, others);
	};
	var peg$f5 = function (prefix, selector) {
		return new matchers.GroupMatcher(prefix, selector);
	};
	var peg$f6 = function (group) {
		return new matchers.NegateMatcher(group);
	};
	var peg$f7 = function (path) {
		return new matchers.NegateMatcher(path);
	};
	var peg$f8 = function (left, operator, right) {
		return new matchers.CompositeMatcher(left, operator, right);
	};
	var peg$f9 = function (left, right) {
		if (right) return new matchers.OrMatcher(left, right);
		else return left;
	};

	var peg$currPos = 0;
	var peg$savedPos = 0;
	var peg$posDetailsCache = [{ line: 1, column: 1 }];
	var peg$maxFailPos = 0;
	var peg$maxFailExpected = [];
	var peg$silentFails = 0;

	var peg$resultsCache = {};

	var peg$result;

	if ('startRule' in options) {
		if (!(options.startRule in peg$startRuleFunctions)) {
			throw new Error('Can\'t start parsing from rule "' + options.startRule + '".');
		}

		peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	}

	function text() {
		return input.substring(peg$savedPos, peg$currPos);
	}

	function offset() {
		return peg$savedPos;
	}

	function range() {
		return {
			source: peg$source,
			start: peg$savedPos,
			end: peg$currPos,
		};
	}

	function location() {
		return peg$computeLocation(peg$savedPos, peg$currPos);
	}

	function expected(description, location) {
		location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);

		throw peg$buildStructuredError(
			[peg$otherExpectation(description)],
			input.substring(peg$savedPos, peg$currPos),
			location
		);
	}

	function error(message, location) {
		location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);

		throw peg$buildSimpleError(message, location);
	}

	function peg$literalExpectation(text, ignoreCase) {
		return { type: 'literal', text: text, ignoreCase: ignoreCase };
	}

	function peg$classExpectation(parts, inverted, ignoreCase) {
		return { type: 'class', parts: parts, inverted: inverted, ignoreCase: ignoreCase };
	}

	function peg$anyExpectation() {
		return { type: 'any' };
	}

	function peg$endExpectation() {
		return { type: 'end' };
	}

	function peg$otherExpectation(description) {
		return { type: 'other', description: description };
	}

	function peg$computePosDetails(pos) {
		var details = peg$posDetailsCache[pos];
		var p;

		if (details) {
			return details;
		} else {
			p = pos - 1;
			while (!peg$posDetailsCache[p]) {
				p--;
			}

			details = peg$posDetailsCache[p];
			details = {
				line: details.line,
				column: details.column,
			};

			while (p < pos) {
				if (input.charCodeAt(p) === 10) {
					details.line++;
					details.column = 1;
				} else {
					details.column++;
				}

				p++;
			}

			peg$posDetailsCache[pos] = details;

			return details;
		}
	}

	function peg$computeLocation(startPos, endPos) {
		var startPosDetails = peg$computePosDetails(startPos);
		var endPosDetails = peg$computePosDetails(endPos);

		return {
			source: peg$source,
			start: {
				offset: startPos,
				line: startPosDetails.line,
				column: startPosDetails.column,
			},
			end: {
				offset: endPos,
				line: endPosDetails.line,
				column: endPosDetails.column,
			},
		};
	}

	function peg$fail(expected) {
		if (peg$currPos < peg$maxFailPos) {
			return;
		}

		if (peg$currPos > peg$maxFailPos) {
			peg$maxFailPos = peg$currPos;
			peg$maxFailExpected = [];
		}

		peg$maxFailExpected.push(expected);
	}

	function peg$buildSimpleError(message, location) {
		return new peg$SyntaxError(message, null, null, location);
	}

	function peg$buildStructuredError(expected, found, location) {
		return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
	}

	function peg$parsestart() {
		var s0, s1, s2, s3;

		var key = peg$currPos * 9 + 0;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$parse_();
		s2 = peg$parseselector();
		if (s2 !== peg$FAILED) {
			s3 = peg$parse_();
			peg$savedPos = s0;
			s0 = peg$f0(s2);
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parsesegment() {
		var s0, s1, s2, s3, s4, s5;

		var key = peg$currPos * 9 + 1;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$parse_();
		s2 = peg$currPos;
		s3 = [];
		if (peg$r0.test(input.charAt(peg$currPos))) {
			s4 = input.charAt(peg$currPos);
			peg$currPos++;
		} else {
			s4 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e0);
			}
		}
		if (s4 !== peg$FAILED) {
			while (s4 !== peg$FAILED) {
				s3.push(s4);
				if (peg$r0.test(input.charAt(peg$currPos))) {
					s4 = input.charAt(peg$currPos);
					peg$currPos++;
				} else {
					s4 = peg$FAILED;
					if (peg$silentFails === 0) {
						peg$fail(peg$e0);
					}
				}
			}
		} else {
			s3 = peg$FAILED;
		}
		if (s3 !== peg$FAILED) {
			s4 = [];
			if (peg$r1.test(input.charAt(peg$currPos))) {
				s5 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s5 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e1);
				}
			}
			while (s5 !== peg$FAILED) {
				s4.push(s5);
				if (peg$r1.test(input.charAt(peg$currPos))) {
					s5 = input.charAt(peg$currPos);
					peg$currPos++;
				} else {
					s5 = peg$FAILED;
					if (peg$silentFails === 0) {
						peg$fail(peg$e1);
					}
				}
			}
			s3 = [s3, s4];
			s2 = s3;
		} else {
			peg$currPos = s2;
			s2 = peg$FAILED;
		}
		if (s2 !== peg$FAILED) {
			s3 = peg$parse_();
			peg$savedPos = s0;
			s0 = peg$f1(s2);
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}
		if (s0 === peg$FAILED) {
			s0 = peg$currPos;
			s1 = peg$parse_();
			if (peg$r2.test(input.charAt(peg$currPos))) {
				s2 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s2 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e2);
				}
			}
			if (s2 !== peg$FAILED) {
				s3 = peg$parse_();
				peg$savedPos = s0;
				s0 = peg$f2(s2);
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parsescope() {
		var s0, s1, s2, s3, s4, s5;

		var key = peg$currPos * 9 + 2;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$parsesegment();
		if (s1 !== peg$FAILED) {
			s2 = [];
			s3 = peg$currPos;
			if (input.charCodeAt(peg$currPos) === 46) {
				s4 = peg$c0;
				peg$currPos++;
			} else {
				s4 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e3);
				}
			}
			if (s4 !== peg$FAILED) {
				s5 = peg$parsesegment();
				if (s5 !== peg$FAILED) {
					s4 = [s4, s5];
					s3 = s4;
				} else {
					peg$currPos = s3;
					s3 = peg$FAILED;
				}
			} else {
				peg$currPos = s3;
				s3 = peg$FAILED;
			}
			while (s3 !== peg$FAILED) {
				s2.push(s3);
				s3 = peg$currPos;
				if (input.charCodeAt(peg$currPos) === 46) {
					s4 = peg$c0;
					peg$currPos++;
				} else {
					s4 = peg$FAILED;
					if (peg$silentFails === 0) {
						peg$fail(peg$e3);
					}
				}
				if (s4 !== peg$FAILED) {
					s5 = peg$parsesegment();
					if (s5 !== peg$FAILED) {
						s4 = [s4, s5];
						s3 = s4;
					} else {
						peg$currPos = s3;
						s3 = peg$FAILED;
					}
				} else {
					peg$currPos = s3;
					s3 = peg$FAILED;
				}
			}
			peg$savedPos = s0;
			s0 = peg$f3(s1, s2);
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parsepath() {
		var s0, s1, s2, s3, s4, s5, s6;

		var key = peg$currPos * 9 + 3;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$currPos;
		if (peg$r3.test(input.charAt(peg$currPos))) {
			s2 = input.charAt(peg$currPos);
			peg$currPos++;
		} else {
			s2 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e4);
			}
		}
		if (s2 !== peg$FAILED) {
			if (input.charCodeAt(peg$currPos) === 58) {
				s3 = peg$c1;
				peg$currPos++;
			} else {
				s3 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e5);
				}
			}
			if (s3 !== peg$FAILED) {
				s2 = [s2, s3];
				s1 = s2;
			} else {
				peg$currPos = s1;
				s1 = peg$FAILED;
			}
		} else {
			peg$currPos = s1;
			s1 = peg$FAILED;
		}
		if (s1 === peg$FAILED) {
			s1 = null;
		}
		s2 = peg$parsescope();
		if (s2 !== peg$FAILED) {
			s3 = [];
			s4 = peg$currPos;
			s5 = peg$parse_();
			s6 = peg$parsescope();
			if (s6 !== peg$FAILED) {
				s5 = [s5, s6];
				s4 = s5;
			} else {
				peg$currPos = s4;
				s4 = peg$FAILED;
			}
			while (s4 !== peg$FAILED) {
				s3.push(s4);
				s4 = peg$currPos;
				s5 = peg$parse_();
				s6 = peg$parsescope();
				if (s6 !== peg$FAILED) {
					s5 = [s5, s6];
					s4 = s5;
				} else {
					peg$currPos = s4;
					s4 = peg$FAILED;
				}
			}
			peg$savedPos = s0;
			s0 = peg$f4(s1, s2, s3);
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parsegroup() {
		var s0, s1, s2, s3, s4, s5, s6;

		var key = peg$currPos * 9 + 4;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$currPos;
		if (peg$r3.test(input.charAt(peg$currPos))) {
			s2 = input.charAt(peg$currPos);
			peg$currPos++;
		} else {
			s2 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e4);
			}
		}
		if (s2 !== peg$FAILED) {
			if (input.charCodeAt(peg$currPos) === 58) {
				s3 = peg$c1;
				peg$currPos++;
			} else {
				s3 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e5);
				}
			}
			if (s3 !== peg$FAILED) {
				s2 = [s2, s3];
				s1 = s2;
			} else {
				peg$currPos = s1;
				s1 = peg$FAILED;
			}
		} else {
			peg$currPos = s1;
			s1 = peg$FAILED;
		}
		if (s1 === peg$FAILED) {
			s1 = null;
		}
		if (input.charCodeAt(peg$currPos) === 40) {
			s2 = peg$c2;
			peg$currPos++;
		} else {
			s2 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e6);
			}
		}
		if (s2 !== peg$FAILED) {
			s3 = peg$parse_();
			s4 = peg$parseselector();
			if (s4 !== peg$FAILED) {
				s5 = peg$parse_();
				if (input.charCodeAt(peg$currPos) === 41) {
					s6 = peg$c3;
					peg$currPos++;
				} else {
					s6 = peg$FAILED;
					if (peg$silentFails === 0) {
						peg$fail(peg$e7);
					}
				}
				if (s6 !== peg$FAILED) {
					peg$savedPos = s0;
					s0 = peg$f5(s1, s4);
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parseexpression() {
		var s0, s1, s2, s3, s4;

		var key = peg$currPos * 9 + 5;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		if (input.charCodeAt(peg$currPos) === 45) {
			s1 = peg$c4;
			peg$currPos++;
		} else {
			s1 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e8);
			}
		}
		if (s1 !== peg$FAILED) {
			s2 = peg$parse_();
			s3 = peg$parsegroup();
			if (s3 !== peg$FAILED) {
				s4 = peg$parse_();
				peg$savedPos = s0;
				s0 = peg$f6(s3);
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}
		if (s0 === peg$FAILED) {
			s0 = peg$currPos;
			if (input.charCodeAt(peg$currPos) === 45) {
				s1 = peg$c4;
				peg$currPos++;
			} else {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e8);
				}
			}
			if (s1 !== peg$FAILED) {
				s2 = peg$parse_();
				s3 = peg$parsepath();
				if (s3 !== peg$FAILED) {
					s4 = peg$parse_();
					peg$savedPos = s0;
					s0 = peg$f7(s3);
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
			if (s0 === peg$FAILED) {
				s0 = peg$parsegroup();
				if (s0 === peg$FAILED) {
					s0 = peg$parsepath();
				}
			}
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parsecomposite() {
		var s0, s1, s2, s3, s4, s5;

		var key = peg$currPos * 9 + 6;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$parseexpression();
		if (s1 !== peg$FAILED) {
			s2 = peg$parse_();
			if (peg$r4.test(input.charAt(peg$currPos))) {
				s3 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s3 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e9);
				}
			}
			if (s3 !== peg$FAILED) {
				s4 = peg$parse_();
				s5 = peg$parsecomposite();
				if (s5 !== peg$FAILED) {
					peg$savedPos = s0;
					s0 = peg$f8(s1, s3, s5);
				} else {
					peg$currPos = s0;
					s0 = peg$FAILED;
				}
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}
		if (s0 === peg$FAILED) {
			s0 = peg$parseexpression();
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parseselector() {
		var s0, s1, s2, s3, s4, s5;

		var key = peg$currPos * 9 + 7;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = peg$currPos;
		s1 = peg$parsecomposite();
		if (s1 !== peg$FAILED) {
			s2 = peg$parse_();
			if (input.charCodeAt(peg$currPos) === 44) {
				s3 = peg$c5;
				peg$currPos++;
			} else {
				s3 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e10);
				}
			}
			if (s3 !== peg$FAILED) {
				s4 = peg$parse_();
				s5 = peg$parseselector();
				if (s5 === peg$FAILED) {
					s5 = null;
				}
				peg$savedPos = s0;
				s0 = peg$f9(s1, s5);
			} else {
				peg$currPos = s0;
				s0 = peg$FAILED;
			}
		} else {
			peg$currPos = s0;
			s0 = peg$FAILED;
		}
		if (s0 === peg$FAILED) {
			s0 = peg$parsecomposite();
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	function peg$parse_() {
		var s0, s1;

		var key = peg$currPos * 9 + 8;
		var cached = peg$resultsCache[key];

		if (cached) {
			peg$currPos = cached.nextPos;

			return cached.result;
		}

		s0 = [];
		if (peg$r5.test(input.charAt(peg$currPos))) {
			s1 = input.charAt(peg$currPos);
			peg$currPos++;
		} else {
			s1 = peg$FAILED;
			if (peg$silentFails === 0) {
				peg$fail(peg$e11);
			}
		}
		while (s1 !== peg$FAILED) {
			s0.push(s1);
			if (peg$r5.test(input.charAt(peg$currPos))) {
				s1 = input.charAt(peg$currPos);
				peg$currPos++;
			} else {
				s1 = peg$FAILED;
				if (peg$silentFails === 0) {
					peg$fail(peg$e11);
				}
			}
		}

		peg$resultsCache[key] = { nextPos: peg$currPos, result: s0 };

		return s0;
	}

	var matchers = require('./scope-selector-matchers');

	peg$result = peg$startRuleFunction();

	if (peg$result !== peg$FAILED && peg$currPos === input.length) {
		return peg$result;
	} else {
		if (peg$result !== peg$FAILED && peg$currPos < input.length) {
			peg$fail(peg$endExpectation());
		}

		throw peg$buildStructuredError(
			peg$maxFailExpected,
			peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
			peg$maxFailPos < input.length
				? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
				: peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
		);
	}
}

module.exports = {
	SyntaxError: peg$SyntaxError,
	parse: peg$parse,
};