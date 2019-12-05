function Data() {
    var weekday;
    var month;
    var rawData;
    var average = (avg, d, _, {
        length
    }) => (avg += d["Processing Time"] / length);

    const ZIP = [78753, 78741, 78704, 78758, 78745, 78723, 78701, 78744, 78702,
        78748, 78759, 78705, 78757, 78752, 78751, 78749, 78746, 78703,
        78731, 78724, 78727, 78721, 78729, 78754, 78750, 78613, 78756,
        78722, 78735, 78747, 78617, 78717, 78726, 78739, 78719, 78660,
        78736, 78730, 78725, 78742, 78653, 78652, 78728, 78737, 78712,
        78732, 78733
    ];

    const MONTH = {
        'Jan': 1,
        'Feb': 2,
        'Mar': 3,
        'Apr': 4,
        'May': 5,
        'Jun': 6,
        'Jul': 7,
        'Aug': 8,
        'Sep': 9,
        'Oct': 10,
        'Nov': 11,
        'Dec': 12,
    };

    const WEEK = {
        'Mon': 0,
        'Tue': 1,
        'Wed': 2,
        'Thu': 3,
        'Fri': 4,
        'Sat': 5,
        'Sun': 6,
    };

    const CRIME_WEIGHT = {
        'Agg Assault': 1.2,
        'Auto Theft': 0.8,
        'Burglary': 0.6,
        'Murder': 1.6,
        'Robbery': 1.4,
        'Theft': 0.4,
    };
    
    const CRIME = Object.keys(CRIME_WEIGHT);

    var safetyIndex = function (array) {
        var reducer = function (sum, datum) {
            sum += CRIME_WEIGHT[datum["Highest NIBRS/UCR Offense Description"]];
            return sum;
        };
        return array.reduce(reducer, 0);
    };

    var getZipArray = (zip) => rawData.filter((item) =>  item["GO Location Zip"] == zip);
    var getClearnceArray = (array) => array.filter((item) => item["Clearance Status"] != "N");

    var processedData = {
        getCrime: () => CRIME,
        getZip: () => ZIP,
        getMonth: () => MONTH,
        setRawData: function (data) {
            rawData = data;
            return processedData;
        },
        getZipArray: () => getZipArray,
        getClearnceArray: () => getClearnceArray,
        getWeekDataByZip: function(zip=512) {
            var arr = rawData;
            if (zip != 512) arr = getZipArray(zip);
            var weekdays = [...Array(7).keys()];
            return Array.from(weekdays, x => arr.filter(d => d.weekday == x).length);
        }, 
        getAllWeekDataByZip: function() {
            var allCrime = {512:this.getWeekDataByZip()};
            ZIP.forEach( zip => {allCrime[zip] = this.getWeekDataByZip(zip);})
            return allCrime;
        },
        getMonthDataByZip: function(zip=512) {
            var arr = rawData;
            if (zip != 512) arr = getZipArray(zip);
            var months = Array.from([...Array(12).keys()], x => x+1);
            return Array.from(months, x => arr.filter(d => d.month == x).length);
        },
        getAllMonthDataByZip: function() {
            var allCrime = {512:this.getMonthDataByZip()};
            ZIP.forEach( zip => {allCrime[zip] = this.getMonthDataByZip(zip);})
            return allCrime;
        },
        getMonthDataByMonth: function(month) {
            var obj = {month:month,512:rawData.filter(d => d["month"] == MONTH[month]).length};
            ZIP.forEach( function (zip) {
                obj[zip]=rawData.filter(d => d["GO Location Zip"] == zip && d["month"] == MONTH[month]).length;
            });
            return obj;
        },
        getAllMonthDataByMonth: function () {
            var allCrime = [];
            Object.keys(MONTH).forEach(d => allCrime.push(this.getMonthDataByMonth(d)));
            return allCrime;
        },
        getCrimeDataByZip: function(zip=512) {
            var arr = rawData;
            if (zip != 512) arr = getZipArray(zip);
            return Array.from(CRIME, x => arr.filter(d => d["Highest NIBRS/UCR Offense Description"]==x).length).reduce((acc, elem, i) => {
                acc[CRIME[i]] = elem;
                return acc;
            }, {});
        },
        getAllCrimeDataByZip: function() {
            var allCrime = {512:this.getCrimeDataByZip()};
            ZIP.forEach( zip => {allCrime[zip] = this.getCrimeDataByZip(zip);})
            return allCrime;
        },
        getCrimeDataByCat: function(crime) {
            var obj = {crime:crime,512:rawData.filter(d => d["Highest NIBRS/UCR Offense Description"] == crime).length};
            ZIP.forEach( function (zip) {
                obj[zip]=rawData.filter(d => d["GO Location Zip"] == zip && d["Highest NIBRS/UCR Offense Description"] == crime).length;
            });
            return obj;
        },
        getAllCrimeDataByCat: function () {
            var allCrime = [];
            CRIME.forEach(d => allCrime.push(this.getCrimeDataByCat(d)));
            return allCrime;
        },
        getAllSafetyIdx: () => Array.from(ZIP, x => safetyIndex(getZipArray(x))).reduce((acc, elem, i) => {
            acc[ZIP[i]] = elem;
            return acc;
        }, {}),
        getZipData: function (zip) {
            var zip_array = getZipArray(zip);
            var clearance = getClearnceArray(zip_array);
            return {
                zip: zip,
                numberOfCases: zip_array.length,
                clearanceRate: clearance.length / zip_array.length,
                clearanceTime: clearance.reduce(average, 0),
                safetyIndex: safetyIndex(zip_array)
            };
        },
        getAllZipData: function () {
            return ZIP.map(this.getZipData);
        },
        getRawData: function () {
            return rawData;
        },
        getGeoCrimeByTime: function(month,weekday){
            var raw = [];
            if (month == 0 && weekday == 0){
                raw = rawData;
            }
            if (month == 0 && weekday !=0){
                raw = rawData.filter(d=>  d['weekday'] == weekday);
            }
            if (month != 0 && weekday ==0){
                raw = rawData.filter(d=> d['month'] == month);
            }
            if (month != 0 && weekday !=0){
            raw = rawData.filter(d=> d['month'] == month && d['weekday'] == weekday);}
            var ret = [];
            raw.forEach(d=> ret.push([d["Highest NIBRS/UCR Offense Description"],[parseFloat(d["Longitude"]),parseFloat(d['Latitude'])]]));
            return ret;
        }
        

    };

    return processedData;
}