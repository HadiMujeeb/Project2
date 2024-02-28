(function ($) {
  "use strict";

  /*Sale statistics Chart*/
  if ($("#myChart").length) {
    var ctx = document.getElementById("myChart").getContext("2d");

    let jan = document.getElementById("jan").value;
    let feb = document.getElementById("feb").value;
    let mar = document.getElementById("mar").value;
    let apr = document.getElementById("apr").value;
    let may = document.getElementById("may").value;
    let jun = document.getElementById("jun").value;
    let jul = document.getElementById("jul").value;
    let aug = document.getElementById("aug").value;
    let sep = document.getElementById("sep").value;
    let oct = document.getElementById("oct").value;
    let nov = document.getElementById("nov").value;
    let dec = document.getElementById("dec").value;

    let Jan = document.getElementById("Jan").value;
    let Feb = document.getElementById("Feb").value;
    let Mar = document.getElementById("Mar").value;
    let Apr = document.getElementById("Apr").value;
    let May = document.getElementById("May").value;
    let Jun = document.getElementById("Jun").value;
    let Jul = document.getElementById("Jul").value;
    let Aug = document.getElementById("Aug").value;
    let Sep = document.getElementById("Sep").value;
    let Oct = document.getElementById("Oct").value;
    let Nov = document.getElementById("Nov").value;
    let Dec = document.getElementById("Dec").value;

    let JanOrders = document.getElementById("JAN").value;
    let FebOrders = document.getElementById("FEB").value;
    let MarOrders = document.getElementById("Mar").value;
    let AprOrders = document.getElementById("APR").value;
    let MayOrders = document.getElementById("MAY").value;
    let JunOrders = document.getElementById("JUN").value;
    let JulOrders = document.getElementById("JUL").value;
    let AugOrders = document.getElementById("AUG").value;
    let SepOrders = document.getElementById("SEP").value;
    let OctOrders = document.getElementById("OCT").value;
    let NovOrders = document.getElementById("NOV").value;
    let DecOrders = document.getElementById("DEC").value;
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Sales",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(44, 120, 220, 0.2)",
            borderColor: "rgba(44, 120, 220)",
            data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec],
          },
          {
            label: "Users",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(4, 209, 130, 0.2)",
            borderColor: "rgb(4, 209, 130)",
            data: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec],
          },
          {
            label: "Orders",
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(380, 200, 230, 0.2)",
            borderColor: "rgb(380, 200, 230)",
            data: [
              JanOrders,
              FebOrders,
              MarOrders,
              AprOrders,
              MayOrders,
              JunOrders,
              JulOrders,
              AugOrders,
              SepOrders,
              OctOrders,
              NovOrders,
              DecOrders,
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });
  } //End if

  /*Sale statistics Chart*/
  if ($("#myChart2").length) {
    var ctx = document.getElementById("myChart2");
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["900", "1200", "1400", "1600"],
        datasets: [
          {
            label: "US",
            backgroundColor: "#5897fb",
            barThickness: 10,
            data: [233, 321, 783, 900],
          },
          {
            label: "Europe",
            backgroundColor: "#7bcf86",
            barThickness: 10,
            data: [408, 547, 675, 734],
          },
          {
            label: "Asian",
            backgroundColor: "#ff9076",
            barThickness: 10,
            data: [208, 447, 575, 634],
          },
          {
            label: "Africa",
            backgroundColor: "#d595e5",
            barThickness: 10,
            data: [123, 345, 122, 302],
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } //end if
})(jQuery);
