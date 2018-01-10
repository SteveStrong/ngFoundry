//http://www.convertcsv.com/csv-to-json.htm
// Copyright 2013 Data Design Group, Inc  All Rights Reserved
var CSV = {
    delimiter: ",",
    detectedDelimiter: ",",
    autodetect: true,
    quote: '"',
    limit: '',
    isFirstRowHeader: true,
    headerToUpper: false,
    headerToLower: false,
    skipEmptyRows: true,
    relaxedMode: true,
    excelMode: true,
    sortNeeded: false,

    maxColumnsFound: 0,
    prevColumnsFound: 0,
    dataRowsFound: 0,
    arHeaderRow: [], // First line of csv if header present
    table: [],
    statsCnt: [],
    fldMaxLen: [],
    displayPoss: "", // display positions starting at 1,2,3,...n. Empty ==>default
    sortPoss: "",  // sort positions starting at 1,2,...n. Empty ==> no sort
    sortIgnoreCase: false,

    parse: function (csv, reviver) {
        var j;
        var s = "";
        reviver = reviver || function (r, c, v) { return v; };
        this.table = [];
        this.statsCnt = [];
        this.arHeaderRow = [];
        this.maxColumnsFound = 0;
        this.dataRowsFound = 0;
        var chars = csv.split('');
        var c = 0;
        var cc = chars.length;
        var start, end, row;
        var cnt = 0;
        var equalUsed = false;
        var savestart;
        if (this.limit != '' && isNaN(this.limit)) this.limit = '';
        detect = { comma: 0, semi: 0, tab: 0, pipe: 0, colon: 0, space: 0 };
        //alert("reset: detect.colon="+detect.colon+", comma="+detect.comma);
        for (j = 0; j < cc; j++) {
            if (j > 1 && (chars[j] == '\r' || chars[j] == '\n')) break;
            if (chars[j] == ",") detect.comma++;
            if (chars[j] == ";") detect.semi++;
            if (chars[j] == "\t") detect.tab++;
            if (chars[j] == "|") detect.pipe++;
            if (chars[j] == ":") detect.colon++;
            if (chars[j] == " ") detect.space++;
        }
        this.detectedDelimiter = this.delimiter;
        //alert("detect.colon="+detect.colon+", comma="+detect.comma);
        // Question - should the presense of one tab indicate tab separated?
        if (detect.tab >= detect.comma && detect.tab >= detect.pipe && detect.tab >= detect.semi && detect.tab >= detect.colon) this.detectedDelimiter = "\t";
        else if (detect.semi > detect.comma && detect.semi > detect.pipe && detect.semi > detect.tab && detect.semi > detect.colon) this.detectedDelimiter = ";";
        else if (detect.colon > detect.comma && detect.colon > detect.pipe && detect.colon > detect.tab && detect.colon > detect.semi) this.detectedDelimiter = ":";
        else if (detect.pipe > detect.comma && detect.pipe > detect.semi && detect.pipe > detect.tab && detect.pipe > detect.colon) this.detectedDelimiter = "|";
        else if (detect.comma > detect.tab && detect.comma > detect.pipe && detect.comma > detect.semi && detect.comma > detect.colon) this.detectedDelimiter = ",";
        if (detect.tab == 0 && detect.comma == 0 && detect.pipe == 0 && detect.colon == 0 && detect.semi == 0 && detect.space > 0) this.detectedDelimiter = " ";
        if (this.autodetect) this.delimiter = this.detectedDelimiter;
        //alert('auto detected ' + this.detectedDelimiter+" ,because ,="+detect.comma+", ;="+detect.semi+", tab="+detect.tab+" ,pipe="+detect.pipe+" ,colon="+detect.colon);
        while (c < cc) { // for each char
            if (this.skipEmptyRows && (chars[c] == '\r' || chars[c] == '\n')) {
                c++;
                continue;
            }
            this.table.push(row = []); // add row to table no fields
            while (c < cc && '\r' !== chars[c] && '\n' !== chars[c]) { // look at one line
                savestart = start = end = c;
                if (this.relaxedMode) { // skip leading space to first double quote
                    while (chars[c] === ' ') {
                        ++c; // skip white stuff at front
                    }
                    if (chars[c] === this.quote) start = c;
                    else c = savestart;
                }
                if (this.excelMode) { // skip equal sign at front, indicates to treat field as text
                    if ((chars[c] === '=') && (c + 1 < cc) && (chars[c + 1] === this.quote)) {
                        start = ++c;
                        equalUsed = true;
                    }
                }
                if (this.quote === chars[c]) { // if doublequote, find matching doublequote
                    start = end = ++c;
                    while (c < cc) {
                        if (this.quote === chars[c]) { // found doublequote
                            if (this.quote !== chars[c + 1]) { break; }
                            else { chars[++c] = ''; } // unescape ""
                        }
                        end = ++c;
                    }
                    if (this.quote === chars[c]) { ++c; }
                    while (c < cc && '\r' !== chars[c] && '\n' !== chars[c] && this.delimiter !== chars[c]) { ++c; }
                } else { // not a doublequote
                    while (c < cc && '\r' !== chars[c] && '\n' !== chars[c] && this.delimiter !== chars[c]) { end = ++c; }
                }
                row.push(reviver(this.table.length - 1, row.length, chars.slice(start, end).join('')));
                if (this.delimiter == ' ') { // crunch spaces if delimiter
                    while (c < cc && chars[c] == this.delimiter) {
                        ++c;
                    }
                }
                if (this.delimiter === chars[c])++c;
            } // while
            if (chars[c - 1] == this.delimiter && this.delimiter != ' ') row.push(reviver(this.table.length - 1, row.length, ''));
            if (row.length > this.maxColumnsFound) this.maxColumnsFound = row.length;
            if ('\r' === chars[c]) { ++c; }
            if ('\n' === chars[c]) { ++c; }
            if (!this.isFirstRowHeader || cnt > 0) { // look at data type
                for (j = 0; j < row.length; j++) { // for each column, gather stats
                    if (j >= this.statsCnt.length || cnt == 0) {
                        this.fldMaxLen[j] = 0;
                        this.statsCnt[j] = { dateCnt: 0, intCnt: 0, realCnt: 0, emptyCnt: 0, bitCnt: 0, equalUsed: false, fieldType: "", fieldDecs: 0, fieldPrec: 0 };
                    }
                    if (row[j].length > this.fldMaxLen[j]) this.fldMaxLen[j] = row[j].length;
                    s = row[j].replace(/^\s+|\s+$/g, '');
                    // Handle Excel format of equal sign in first position
                    //alert("before:"+s);
                    if (this.excelMode && s.length > 2 && s.substr(0, 2) === '="' && s.substr(s.length - 1) === '"') {
                        this.statsCnt[j].equalUsed = true;
                        var e = new RegExp(this.quote + this.quote, "gmi");
                        s = row[j] = s.substr(2, s.length - 3).replace(e, this.quote);
                        //alert(s);
                    }
                    if (s == "") this.statsCnt[j].emptyCnt++;
                    if (s != "" && !isNaN(s)) {
                        this.statsCnt[j].realCnt++;
                        var dc = s.split('.');
                        if (dc[0].length > this.statsCnt[j].fieldPrec) this.statsCnt[j].fieldPrec = dc[0].length;
                        if (dc.length > 1) {
                            if (dc[1].length > this.statsCnt[j].fieldDecs) this.statsCnt[j].fieldDecs = dc[1].length;
                        }
                    }
                    if (s != "" && !isNaN(s) && s.indexOf('.') < 0) this.statsCnt[j].intCnt++;
                    if (s === "0" || s === "1") this.statsCnt[j].bitCnt++;
                    var re = /^(19|20)\d\d[- \/.](0?[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])$|^(0?[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$|^(0?[1-9]|[12][0-9]|3[01])[- \/.](0?[1-9]|1[012])[- \/.](19|20)\d\d$/;
                    //var re = /=============/;
                    //alert("s="+s+",test="+re.test(s));
                    if (re.test(s)) { this.statsCnt[j].dateCnt++; }
                }
            }
            cnt++; // # of rows
            //alert('Limit='+this.limit);
            if (this.limit != '' && cnt - (this.isFirstRowHeader ? 1 : 0) >= this.limit * 1) break;
        }
        this.dataRowsFound = cnt - (this.isFirstRowHeader ? 1 : 0);
        if (this.isFirstRowHeader && this.table.length > 0) {
            this.arHeaderRow = this.table.shift(); // remove header from data and assign to var
            for (j = 0; j < this.maxColumnsFound; j++) {
                if (!this.arHeaderRow[j] || this.arHeaderRow[j] == "") this.arHeaderRow[j] = "FIELD" + (j + 1);
                this.arHeaderRow[j] = this.arHeaderRow[j].trim();
            }
        }
        if (this.arHeaderRow.length > 0) {
            for (j = 0; j < this.arHeaderRow.length; j++) this.determineCsvColType(j);
        }
        else if (this.table.length > 0) {
            for (j = 0; j < this.maxColumnsFound; j++) {
                if (!this.arHeaderRow[j] || this.arHeaderRow[j] == "") this.arHeaderRow[j] = "FIELD" + (j + 1);
                this.determineCsvColType(j);
            }
        }

        for (j = 0; j < this.arHeaderRow.length; j++) {
            if (this.headerToUpper) this.arHeaderRow[j] = this.arHeaderRow[j].toUpperCase();
            if (this.headerToLower) this.arHeaderRow[j] = this.arHeaderRow[j].toLowerCase();
        }
        if (this.sortPoss != "") {
            //alert("sort it");
            this.table.sort(this.sortCsv);
            //alert('done sorting');
        }
        //alert('bottom of parse, length of table is '+this.table.length+", len of hdr="+this.arHeaderRow.length);
        return 0;
    },

    setSortFlds: function (flds) {
        CSV.sortPoss = flds.trim();
    },

    sortCsv: function (a, b) {
        //alert('sortCSV, sortcols='+CSV.sortPoss+', a='+a+", b="+b+",dataRowsFound="+CSV.dataRowsFound);
        if (CSV.sortPoss == "") return 0;
        var p = [];
        var q = [];
        var t = [];
        p = CSV.sortPoss.split(",");
        for (j = 0; j < p.length; j++) {
            q[j] = 1;
            t[j] = "";
            if (p[j].right(1).toUpperCase() == 'D') {
                q[j] = -1;
                p[j] = p[j].left(p[j].length - 1);
            }
            switch (p[j].left(1).toUpperCase()) {
                case 'C':
                    t[j] = 'C';
                    p[j] = p[j].right(p[j].length - 1);
                    break;
                case 'N':
                    t[j] = 'N';
                    p[j] = p[j].right(p[j].length - 1);
                    break;
                default:
                    break;
            }

        }
        for (j = 0; j < p.length; j++) if (!isNaN(p[j])) p[j] = (p[j] * 1) - 1; else p[j] = -1;
        for (j = 0; j < p.length; j++) if (p[j] >= a.length) p[j] = -1;
        for (j = 0; j < p.length; j++) {
            if (p[j] < 0) continue;
            //alert("j="+j+",p[j]="+p[j]+"type="+t[j]);
            if (!isNaN(a[p[j]]) && !isNaN(b[p[j]]) && CSV.dataRowsFound == CSV.statsCnt[p[j]].realCnt + CSV.statsCnt[p[j]].emptyCnt && t[j] != 'C') {
                if (a[p[j]] * 1 < b[p[j]] * 1) return -1 * q[j];
                if (a[p[j]] * 1 > b[p[j]] * 1) return 1 * q[j];
            }
            else {
                if (CSV.sortIgnoreCase) {
                    if (a[p[j]].toUpperCase() < b[p[j]].toUpperCase()) return -1 * q[j];
                    if (a[p[j]].toUpperCase() > b[p[j]].toUpperCase()) return 1 * q[j];
                } else {
                    if (a[p[j]] < b[p[j]]) return -1 * q[j];
                    if (a[p[j]] > b[p[j]]) return 1 * q[j];
                }
            }
        }
        return 0;
    },

    determineCsvColType: function (colPos) {
        var j = 0
        var k = 0;
        if (this.table.length == 0) return "";
        //alert("this.table.length="+this.table.length+",colpos="+colPos);
        //alert("date="+this.statsCnt[colPos].dateCnt);
        //alert("int="+this.statsCnt[colPos].intCnt);
        //alert("real="+this.statsCnt[colPos].realCnt);
        //alert("bit="+this.statsCnt[colPos].bitCnt);
        if (colPos >= this.statsCnt.length) this.statsCnt[colPos] = { dateCnt: 0, intCnt: 0, realCnt: 0, emptyCnt: 0, bitCnt: 0, fieldType: "" };
        if (this.table.length == this.statsCnt[colPos].bitCnt) { this.statsCnt[colPos].fieldType = "B"; return "B"; }  //Bit
        if (this.table.length == this.statsCnt[colPos].dateCnt) { this.statsCnt[colPos].fieldType = "D"; return "D"; } //Date
        if (this.table.length == this.statsCnt[colPos].intCnt) { this.statsCnt[colPos].fieldType = "I"; return "I"; }  //Int
        if (this.table.length == this.statsCnt[colPos].realCnt) { this.statsCnt[colPos].fieldType = "N"; return "N"; } //Numeric

        if (this.statsCnt[colPos].bitCnt > 0 && this.table.length == this.statsCnt[colPos].bitCnt + this.statsCnt[colPos].emptyCnt) { this.statsCnt[colPos].fieldType = "B"; return "B"; }  //Bit
        if (this.statsCnt[colPos].dateCnt > 0 && this.table.length == this.statsCnt[colPos].dateCnt + this.statsCnt[colPos].emptyCnt) { this.statsCnt[colPos].fieldType = "D"; return "D"; } //Date
        if (this.statsCnt[colPos].intCnt > 0 && this.table.length == this.statsCnt[colPos].intCnt + this.statsCnt[colPos].emptyCnt) { this.statsCnt[colPos].fieldType = "I"; return "I"; }  //Int
        if (this.statsCnt[colPos].realCnt > 0 && this.table.length == this.statsCnt[colPos].realCnt + this.statsCnt[colPos].emptyCnt) { this.statsCnt[colPos].fieldType = "N"; return "N"; } //Numeric
        //alert('at end of det col type, setting to vc for col:'+colPos);
        this.statsCnt[colPos].fieldType = "VC";
        return "VC"; // variable character string
    },

    // convert a table to csv
    stringify: function (table, replacer) { // recreate csv from table
        replacer = replacer || function (r, c, v) { return v; };
        var csv = '';
        var c;
        var cc;
        var r;
        var rr = table.length;
        var cell;
        for (r = 0; r < rr; ++r) { // for each row
            if (r) { csv += '\r\n'; } // add newline for rows>0
            for (c = 0, cc = table[r].length; c < cc; ++c) {
                if (c) { csv += this.delimiter; }
                cell = replacer(r, c, table[r][c]);
                // If comma or newline then wrap quotes around text and double up on quotes 
                // Note that , needs to be changed to this.delimiter
                if (/[,\r\n"]/.test(cell)) { cell = this.quote + cell.replace(/"/g, this.quote + this.quote) + this.quote; }
                csv += (cell || 0 === cell) ? cell : '';
            }
        }
        return csv;
    }
};