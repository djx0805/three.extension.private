let getSunLight = function (jd, jf, wd, year, month, day, hour, minute) {
    let a= year/4.0;
    let n0 = 79.6764 + 0.2422*(year - 1985) - parseInt((year-1985)/4.0);

    let b = a - parseInt(a);
    let c=32.8;
    if(month<=2) {
        c=30.6;
    }
    if(b===0 && month>2) {
        c=31.8;
    }
    let g = parseInt(30.6*month - c + 0.5) + day;
    let l = (jd+jf/60.0)/15.0;
    let h=hour - 8.0 + minute/60.0;
    let n = g + (h - l)/24;

    let tmp = 2*3.1415926*(n-n0)/365.2422;
    let er = 1.000423 + 0.032359*Math.sin(tmp) + 0.000086*Math.sin(2*tmp) - 0.008349*Math.cos(tmp) + 0.000115*Math.cos(2*tmp);
    let ed = 0.3723+23.2567*Math.sin(tmp) + 0.1149*Math.sin(2*tmp) - 0.1712*Math.sin(3*tmp) - 0.758*Math.cos(tmp) + 0.3656*Math.cos(2*tmp) + 0.0201*Math.cos(3*tmp);
    let et = 0.0028 - 1.9857*Math.sin(tmp) + 9.9059*Math.sin(2*tmp)-7.0924*Math.cos(tmp) - 0.6882*Math.cos(2*tmp);


    let sd = hour + (minute - (120.0 - (jd + jf/60))*4)/60;
    let s0 = sd + et/60.0;
    tmp = (s0 - 12)*15;
    let sinh0 = Math.sin(ed*3.1415926/180)*Math.sin(wd*3.1415926/180.0) + Math.cos(ed*3.1415926/180)*Math.cos(wd*3.1415926/180.0)*Math.cos(tmp*3.1415926/180);
    let h0 = Math.asin(sinh0);
    let sina = (-Math.sin(tmp*3.1515926/180)*Math.cos(ed*3.1415926/180))/Math.cos(h0);
    //
    h0 = h0*180/3.1415926;
    a = Math.asin(sina)*180/3.1415926;

    return {ha:h0, aa:a};
}
