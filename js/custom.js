
    /**
     * Properties
     */
    var props = {
        apiUrl: 'https://stark-island-54204.herokuapp.com/cloud/api/beta/',
        indicators: {
            block: $('#indicators_box'),
            control: $('#indicators_control'),
            options: [
                { key: 'sma', value: 'SMA' },
                { key: 'rsi', value: 'RSI' },
                { key: 'ema', value: 'EMA' },
                { key: 'atr', value: 'ATR' }
            ]
        },
        chart: null,
        seriesVolumeId: 'VOLUME',
        seriesCandleId: '' // depends on the currency pair value
    };

    $(document).ready(function(){
      earlyAccessStopper()
                userAuth();
                initCandleChart();
                initChartIndicators();
                initNews();
                listenForChartUpdate();
                circlesNavActivate();
                getWatchlistCurrencies();
                getWatchlistCommodities();
                getWatchlistStocks();
                getWatchlistIndexes();
                //for when user clicks out of suggested results
                removeResultsListen();
                timerController()
                howLongStay()
                checkMobile();
                tradeOrderTotalsListen()
                initList();
                initHideNewsReel()
                mixT('Loaded Site');


            })

    /**
     * Indicators select box initialization
     */
    function initChartIndicators() {
        var control = props.indicators.control;

        props.indicators.options.forEach(function(item) {
            var option = $('<option>').attr('value', item.key).text(item.value);
            control.append(option);
        });

        control.on('change', onIndicatorsChange);
    }

    /**
     * Change handler of the indicators select box
     */
    function onIndicatorsChange() {
        var chart = props.chart,
            indicators = chart.indicators.allItems,
            indicatorType = this.value;

        indicators.forEach(function(indicator) {
            indicator.destroy();
        });

        var indicator = getIndicator(indicatorType);
        chart.addIndicator(indicator, true);
    }

    function checkMobile(){

      if(localStorage.getItem('earlyAccess')!='hello'){
        return;
      }
      if(screen.width < 800){

        lity('#notIdeal');

      }
    }

    function proceedAnyway(){
      $('.lity-close').click()
    }

    function howLongStay(){


      setTimeout(function(){
        mixT('stayed 30 seconds')
      }, 30000)

       setTimeout(function(){
        mixT('stayed 2 mins')
      }, 120000)


        setTimeout(function(){
        mixT('stayed 10 mins')
      }, 600000)




        setTimeout(function(){
        mixT('stayed 30 mins')
      }, 1800000)
    }

    /**
     * Get options of a specific indicator by its type
     * @param {String} type
     * @return {Object}
     */
    function getIndicator(type) {
        var seriesId = props.seriesVolumeId;

        if (type === 'rsi' || type === 'atr') {
            seriesId = props.seriesCandleId;
        }

        var indicator = {
            id: seriesId,
            type: type,
            params: {
                period: 14,
                index: 0
            },
            styles: {
                strokeWidth: 1,
                stroke: 'yellow',
                dashstyle: 'solid'
            }
        };

        if (type === 'rsi' || type === 'atr') {
            indicator.yAxis = {
                opposite: true,
                title: {
                    x: -10
                }
            };
        }

        return indicator;
    }


function earlyAccessStopper(){

if(localStorage.getItem('earlyAccess') != "hello"){
   lity('#alphaForm');
  $('.lity-close').hide()
}
 
}

function checkAccessCode(){

  //yes, its not that hard to bypass :)

  if($('#alphaCode').val().toLowerCase() != 'prft0218'){
    alert("Invalid Access Code");
    mixT('invalid access code')

  }else{
     $('.lity-close').show()
     $('.lity-close').click()
     localStorage.setItem('earlyAccess', 'hello')
     mixT('got access')
     checkMobile();
  }

 
}
//variable for not flickering the results autocomplete
justRenderedResults = false;


function clickedOnCrypto(whichCrypto, whichCryptoName){
  //sidepanel

   renderNonExchangeAveragePriceMaybeStock(whichCrypto+"USD", whichCryptoName);

}



function clickOnCommodityIndex(whichComm, whichCommName){
   renderNonExchangeAveragePriceMaybeStock(whichComm, whichCommName);

}

function timerController(timedArr){
  timedCalls = [{"function":"getTicker", "time":50}, {"function":"getNews", "time":1800}, {"function":"getTickerNews", "time":3600},{"function":"getWatchlistCurrencies", "time":300} ]

  for(i in timedCalls){
    setTimer(timedCalls[i])
  }
}

function setTimer(timerElem){

    setTimeout( callAndResetTimer, timerElem["time"]*1000, timerElem["function"], timerElem["time"]);
}

function callAndResetTimer(functionName, theTime){
  eval(functionName +"()");
  setTimer({"time":theTime, "function":functionName})
}

function mixT(userAction){
  try{
    mixpanel.track(userAction);
  }
  catch(e){
    console.log('could not log mixp')
  }
  
}



chartRequestUrl="";
function renderNonExchangeAveragePriceMaybeStock(symbol, name){
$('#indicators_box').hide();
$('#containerCoor').hide();


$('#tradeTotal').hide()
$('#tradeTotal1').hide()

// ---
  getNews(name);
  $('.symbol1').html(symbol.toUpperCase());
justRenderedResults = true;

setTimeout(function(){
  justRenderedResults=false;
}, 3000);

$('#resultsContainer').hide();
 $('#searchInput').val(name);
  thePeriod = $('#period').val();
  showLoading();


  chartRequestUrl = 'https://stark-island-54204.herokuapp.com/cloud/api/beta/getStockChart.php';
      $('.traditionalCats').show();
       $('.cryptoCats').hide();
         $('#cryptoStats').hide()

  if(symbol.indexOf('USD') !=-1){
    symbol= symbol.split('USD')[0].split('/USD')[0];

        $('.traditionalCats').hide();
       $('.cryptoCats').show();
     chartRequestUrl = 'https://stark-island-54204.herokuapp.com/cloud/api/beta/getCryptoUnpopular.php';
     mixT('viewed non exchange crypto')
    $('#cryptoStats').show()


  }

  if(symbol.indexOf('/') !=-1 || symbol.indexOf('Future') !=-1 || symbol.indexOf('(') !=-1   ){


    $('.traditionalCats').show();
       $('.cryptoCats').hide();
       symbol= symbol.split(' (')[0];
     chartRequestUrl = 'https://stark-island-54204.herokuapp.com/cloud/api/beta/getIndexFuturesChart.php';
       $('#cryptoStats').hide()
     mixT('clicked or searched index/future')
  }

  $.ajax({
    url:chartRequestUrl,
    data:{'symbol':symbol, 'period':thePeriod},

    complete:function(transport){
      hideLoading();
      stockResp = $.parseJSON(transport.responseText);
      theSymbol = symbol;


      if(stockResp.info.length==0){



        alert("No chart data for this");
       
        return;
      }
    










      currencyExists=false;
      $('#currencypair option').each(function(){
        if($(this).val()==symbol){
          console.log('yaaaa');

          currencyExists = true;
          if($(this).val() == symbol){
          $('#currencypair').val(symbol);
          $('#exchange').val(stockResp['info'][0]['exchange']);
          console.log('updated');

            if(stockResp.info[0]['type'] =="crypto"){
              $('#hello select').trigger('change');
              return;
            }


          }
        }
      })



      if(currencyExists==false){

        if(chartRequestUrl.indexOf('getIndexFuturesChart')!=-1){
          theSymbol = stockResp['info'][0]['symbol'];
        }
        $('#currencypair').append('<option value="'+theSymbol+'-maybeNotCrypto">'+theSymbol+'</option>');
        

        $('#exchange').append('<option value="'+stockResp.info[0]['exchange']+'-maybeNotCrypto">'+stockResp.info[0]['exchange']+'</option>');


         setTimeout(function(){
          $('#currencypair').val(theSymbol+'-maybeNotCrypto');
          $('#exchange').val(stockResp.info[0]['exchange']+'-maybeNotCrypto')
        },200);


      }


      //getCorr();


      setTimeout(function(){
          if(chartRequestUrl.indexOf('getCryptoUnpopular') !=-1 || chartRequestUrl.indexOf('getIndexFuturesChart')!=-1){
      
            getCorr();
          }
      }, 250)


      data = stockResp.data.slice(-70);


      if(typeof data.status =="string"){
    alert(data.msg);
    return;
}

      $('#tickerCurrency').html(stockResp.info[0]['symbol']);
      $('#tickerPrice').html("$"+stockResp.data[(data.length-1)][4])


              $('#buyPrice').val(parseFloat(stockResp.data[(data.length-1)][4]).toFixed(2));
        $('#sellPrice').val(parseFloat(stockResp.data[(data.length-1)][4]).toFixed(2));

      $('#chartdiv').hide();

    // split the data set into ohlc and volume
    var ohlc = [],
        volume = [],
        dataLength = data.length,
        // set the allowed units for data grouping
        groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]],

        i = 0;

    for (i; i < dataLength; i += 1) {
        ohlc.push([
            data[i][0], // the date
            data[i][1], // open
            data[i][2], // high
            data[i][3], // low
            data[i][4] // close
        ]);

        volume.push([
            data[i][0], // the date
            data[i][5] // the volume
        ]);
    }


    // create the chart



    Highcharts.theme = {
   colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
      '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
   chart: {
      backgroundColor: "#2f3e47",
      style: {
         fontFamily: '\'Unica One\', sans-serif'
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '20px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3'

         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0'
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: '#f05050',
         color: "#f05050",
         upColor: '#0dc569',
         upLineColor: "#0dc569"
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: 'red',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);


    Highcharts.stockChart('container', {

        panning:true,

        rangeSelector: {
            selected: 1
        },

        title: {
            text: stockResp.info[0]['name']+ ' Historical'
        },

        yAxis: [{
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true
        },

        series: [{
            type: 'candlestick',
            name: stockResp.info[0]['symbol'],
            data: ohlc,
            dataGrouping: {
                units: groupingUnits
            }
        }, {
            type: 'column',
            name: 'Volume',
            data: volume,
            yAxis: 1,
            // upColor:"red"
            dataGrouping: {
                units: groupingUnits
            }
        }]
    });


























    }

  })
}


 function renderOrderBook(exchange, currencypair){

      $('.symbol1').html(currencypair.replace('USD', ''));
 chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "dark",
  "dataLoader": {
    //https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_ETH&depth=50
    "url": "https://stark-island-54204.herokuapp.com/cloud/api/beta/order"+whichExchange+".php?currencypair="+currencypair,
    "format": "json",
    "reload": 600,
    "postProcess": function(data) {
      rData = data;
      
      // Function to process (sort and calculate cummulative volume)
      function processData(list, type, desc) {
        
        // Convert to data points
        for(var i = 0; i < list.length; i++) {
          list[i] = {
            value: Number(list[i][0]),
            volume: Number(list[i][1]),
          }
        }
       
        // Sort list just in case
        list.sort(function(a, b) {
          if (a.value > b.value) {
            return 1;
          }
          else if (a.value < b.value) {
            return -1;
          }
          else {
            return 0;
          }
        });
        
        // Calculate cummulative volume
        if (desc) {
          for(var i = list.length - 1; i >= 0; i--) {
            if (i < (list.length - 1)) {
              list[i].totalvolume = list[i+1].totalvolume + list[i].volume;
            }
            else {
              list[i].totalvolume = list[i].volume;
            }
            var dp = {};
            dp["value"] = list[i].value;
            dp[type + "volume"] = list[i].volume;
            dp[type + "totalvolume"] = list[i].totalvolume;
            res.unshift(dp);
          }
        }
        else {
          for(var i = 0; i < list.length; i++) {
            if (i > 0) {
              list[i].totalvolume = list[i-1].totalvolume + list[i].volume;
            }
            else {
              list[i].totalvolume = list[i].volume;
            }
            var dp = {};
            dp["value"] = list[i].value;
            dp[type + "volume"] = list[i].volume;
            dp[type + "totalvolume"] = list[i].totalvolume;
            res.push(dp);
          }
        }
       
      }
      
      // Init
      var res = [];
      processData(data.bids, "bids", true);
      processData(data.asks, "asks", false);

      $("#md-buy-tbody").html('');
        $("#md-sell-tbody").html('');
      for(i in data.bids){


        if(i <15){

         renderSellBuyTD("#md-buy-tbody", data.bids[i]['volume'], data.bids[i]['value']);
        }
      }

      for(i in data.asks){
             if(i <15){

        renderSellBuyTD("#md-sell-tbody", data.asks[i]['volume'], data.asks[i]['value']);
      }
      }
      
      //console.log(res);
      return res;
    }
  },
  "graphs": [{
    "id": "bids",
    "fillAlphas": 0.8,
    "lineAlpha": 1,
    "lineThickness": 2,
    "lineColor": "#0f0",
    "type": "step",
    "valueField": "bidstotalvolume",
    "balloonFunction": balloon
  }, {
    "id": "asks",
    "fillAlphas": 0.8,
    "lineAlpha": 1,
    "lineThickness": 2,
    "lineColor": "#f00",
    "type": "step",
    "valueField": "askstotalvolume",
    "balloonFunction": balloon
  }, {
    "lineAlpha": 0,
    "fillAlphas": 0.2,
    "lineColor": "#000",
    "type": "column",
    "clustered": false,
    "valueField": "bidsvolume",
    "showBalloon": false
  }, {
    "lineAlpha": 0,
    "fillAlphas": 0.2,
    "lineColor": "#000",
    "type": "column",
    "clustered": false,
    "valueField": "asksvolume",
    "showBalloon": false
  }],
  "categoryField": "value",
  "chartCursor": {},
  "balloon": {
    "textAlign": "left"
  },
  "valueAxes": [{
    "axisAlpha": 0,
    "gridThickness": 0,
    "labelsEnabled": false
  }],
  "categoryAxis": {
    "axisAlpha": 0,
    "gridThickness": 0,
    "labelsEnabled": false
  },
  "export": {
    "enabled": false
  }
});

}

function balloon(item, graph) {
  var txt;
  if (graph.id == "asks") {
    txt = "Ask: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.askstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.asksvolume, graph.chart, 4) + "</strong>";
  }
  else {
    txt = "Bid: <strong>" + formatNumber(item.dataContext.value, graph.chart, 4) + "</strong><br />"
      + "Total volume: <strong>" + formatNumber(item.dataContext.bidstotalvolume, graph.chart, 4) + "</strong><br />"
      + "Volume: <strong>" + formatNumber(item.dataContext.bidsvolume, graph.chart, 4) + "</strong>";
  }
  return txt;
}

function formatNumber(val, chart, precision) {
  return AmCharts.formatNumber(
    val, 
    {
      precision: precision ? precision : chart.precision, 
      decimalSeparator: chart.decimalSeparator,
      thousandsSeparator: chart.thousandsSeparator
    }
  );
}



function getNews(topic){

$('#whatOn').html(topic);
getMarketCapInfo(topic);
 getRecommendInfo(topic);
   $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getNews.php?query='+topic,
      complete:function(transport){
          theNewsResults = $.parseJSON(transport.responseText);
          $('#newsStories').html('');
          $('#latestTitle').html("Latest on "+capitalizeFirstLetter(topic));
          for(i in theNewsResults){
            if(theNewsResults[i]['type']=="reddit"){
              sourceString="Reddit";
            }
            else{
              sourceString="Google News";
            }
            newsString = '<div class="" style="overflow-y: hidden; background: transparent;border-bottom: 2px solid #636b6f;"><h4 style="font-weight: lighter;"><a href="'+theNewsResults[i]['url']+'" target="_blank" style="text-decoration:none; color:white">'+theNewsResults[i]['title']+'</a></h4><h5 style="color: grey;">'+theNewsResults[i]['description']+'</h5><h5 style="color: lightgrey;">'+sourceString+'<span style="float:right;">'+theNewsResults[i]['when']+'</span></h5></div>';
            $('#newsStories').append(newsString);


          }

        }
      })

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function removeResultsListen(){

  $('.content-page, .side-menu, .topbar').on('click', function(){

    $('#resultsContainer').hide();

  });
   

}

function searchEnter(){
  
searchTerm = $('#searchInput').val().toUpperCase()
  switch(searchTerm){

    case "DES":
    justRenderedResults = true;
      $('#resultsContainer').hide();
      $('#searchInput').val(searchTerm)
     
      setTimeout(function(){
          justRenderedResults = false;

      },4000)

      getDesc();
    break;
    default:
    console.log('no commend')
    break;
  }
  //TODO, when user presses enter, get the thing that makes sense

}


function scrollToNews(){

  $('html, body').animate({
        scrollTop: $("#newsStories").offset().top-80
    }, 1000);

    mixT('clicked my news')
}

function goToNotes(){

  $('html, body').animate({
        scrollTop: $(".notesSec").offset().top
    }, 1000);



  mixT('clicked my notes')
}

function goToCoor(){
   $('html, body').animate({
        scrollTop: $("#coorContainer1").offset().top
    }, 1000);
     mixT('clicked correlations')
  
}

function getDesc(){
   lity('#descSection');
     $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getDesc.php?symbol='+$('#currencypair').val().split('USD')[0],
      complete:function(transport){
          descResults= $.parseJSON(transport.responseText);
          $('#descDesc').html(descResults['data']['description']);
          $('#descName').html(descResults['data']['currencyName']);
         

}
})

     mixT('got description of asset')
   }


function getWatchlistCurrencies(){

  

   $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getCurrencies.php',
      complete:function(transport){
          theCurResults = $.parseJSON(transport.responseText);

          $('#currencyTable tbody').html('');
          for(i in theCurResults){
            var theChange = parseFloat(theCurResults[i]['percent_change_24h']);
            if(theChange <0){
              var changeString= '<span style="color:#f05050">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            else{
              var changeString= '<span style="color:#15a661">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            tableTr = ' <tr><th scope="row">'+theCurResults[i]['rank']+'</th> <td><a href="javascript:clickedOnCrypto(\''+theCurResults[i]['symbol']+'\', \''+theCurResults[i]['name']+'\')" style="text-decoration:non; color:white">'+theCurResults[i]['symbol']+'</a></td><td>$'+numberWithCommas(parseFloat(theCurResults[i]['price_usd']).toFixed(2))+'</td><td>'+changeString+'</td></tr>';
             $('#currencyTable tbody').append(tableTr);
          }




      }
    });

}


function getWatchlistCommodities(){

  

   $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getCommodities.php',
      complete:function(transport){
          theCurResults = $.parseJSON(transport.responseText);

          $('#commodityTable tbody').html('');
          for(i in theCurResults){
            var theChange = parseFloat(theCurResults[i]['percent_change_24h']);
            if(theChange <0){
              var changeString= '<span style="color:#f05050">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            else{
              var changeString= '<span style="color:#15a661">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            tableTr = ' <tr><td><a href="javascript:clickOnCommodityIndex(\''+theCurResults[i]['symbol']+'\', \''+theCurResults[i]['symbol']+'\')" style="text-decoration:none; color:white">'+theCurResults[i]['symbol']+'</a></td> <td>$'+numberWithCommas(parseFloat(theCurResults[i]['price_usd']).toFixed(2))+'</td><td>'+changeString+'</td><td>'+theCurResults[i]['signal']+'</td></tr>';
             $('#commodityTable tbody').append(tableTr);
          }




      }
    });

}


function getWatchlistIndexes(){

  

   $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getIndexes.php',
      complete:function(transport){
          theCurResults = $.parseJSON(transport.responseText);

          $('#indexTable tbody').html('');
          for(i in theCurResults){
            var theChange = parseFloat(theCurResults[i]['percent_change_24h']);
            if(theChange <0){
              var changeString= '<span style="color:#f05050">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            else{
              var changeString= '<span style="color:#15a661">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            tableTr = ' <tr><td><a href="javascript:clickOnCommodityIndex(\''+theCurResults[i]['symbol']+'\', \''+theCurResults[i]['symbol']+'\')" style="text-decoration:none; color:white">'+theCurResults[i]['symbol']+'</a></td> <td>$'+numberWithCommas(parseFloat(theCurResults[i]['price_usd']).toFixed(2))+'</td><td>'+changeString+'</td><td>'+theCurResults[i]['signal']+'</td></tr>';
             $('#indexTable tbody').append(tableTr);
          }




      }
    });

}


function getWatchlistStocks(){

  

   $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getStocks.php',
      complete:function(transport){
          theCurResults = $.parseJSON(transport.responseText);

          $('#stockTable tbody').html('');
          for(i in theCurResults){
            var theChange = parseFloat(theCurResults[i]['percent_change_24h']);
            if(theChange <0){
              var changeString= '<span style="color:#f05050">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            else{
              var changeString= '<span style="color:#15a661">'+theCurResults[i]['percent_change_24h']+'%</span>';
            }
            tableTr = ' <tr><td>'+theCurResults[i]['symbol']+'</td> <td>$'+numberWithCommas(parseFloat(theCurResults[i]['price_usd']).toFixed(2))+'</td><td>'+changeString+'</td><td>'+theCurResults[i]['signal']+'</td></tr>';
             $('#stockTable tbody').append(tableTr);
          }




      }
    });

}



function getSuggestedSearch(){

  lastInput = $('#searchInput').val();

  setTimeout(function(){

    //wait til user pauses
    if(lastInput ==  $('#searchInput').val() && lastInput !='' ){

      
mixT('User searched');

         $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/search.php?query='+$('#searchInput').val(),
      complete:function(transport){

        theRespResults = $.parseJSON(transport.responseText);

        $('#resultsContainer').html('');
        for(i in theRespResults){
          if(typeof theRespResults[i]['exec'] == "string"){
             $('#resultsContainer').append('<br><b><a href="javascript:'+theRespResults[i]['exec']+'" link="'+theRespResults[i]['symbol']+'">'+theRespResults[i]['name'] +"</a></b><br><hr>");

          }
          else{
            $('#resultsContainer').append('<br><a href="javascript:renderNonExchangeAveragePriceMaybeStock(\''+theRespResults[i]['symbol']+'\', \''+theRespResults[i]['name']+'\')" link="'+theRespResults[i]['symbol']+'">'+theRespResults[i]['name'] +"</a><br><hr>");

          }
          
        }

        if(justRenderedResults==false){
          $('#resultsContainer').show('slow');
        }

        }
      })



    }
  }, 600)
  
}



 function placeOrder(){
      
      
mixT('attempted to place real order')
            alert("Real Orders coming soon. You will be able to add your authentication keys here, store them locally, and the orders will be placed and appear in your real balance above in the nav bar, next to your mock balances.");
          }
            function updateCandleChart(){

                whichExchange = $('#exchange').val();
                whichCurrency = $('#currencypair').val();
                whichPeriod = $('#period').val();
                renderCandleChart(whichExchange, whichCurrency, whichPeriod);

            }

            function updateOrderBook(){
                  whichExchange = $('#exchange').val();
                whichCurrency = $('#currencypair').val();
              
                renderOrderBook(whichExchange, whichCurrency);
            }


            function renderCandleChart(exchange, currencypair, period){
                // Set candle chart id globally

                $('.traditionalCats').hide();
       $('.cryptoCats').show();

       $('#tradeTotal').hide()
$('#tradeTotal1').hide()


                $('#indicators_box').show();
                props.seriesCandleId = currencypair;

               

                $.getJSON('https://stark-island-54204.herokuapp.com/cloud/api/beta/'+exchange+'.php?currencypair='+currencypair+"&period="+period, function (data) {
console.log(data)
hideLoading();
if(typeof data.status =="string"){
    alert(data.msg);
    return;
}

$('#chartdiv').show();
    // split the data set into ohlc and volume
    var ohlc = [],
        volume = [],
        // set the allowed units for data grouping
        groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]];

    data.forEach(function(item) {
        var itemDate = item[0],
            itemOpen = item[1],
            itemHigh = item[2],
            itemLow = item[3],
            itemClose = item[4],
            itemVolume = item[5];

        var isRising = (itemClose > itemOpen),
            itemColor = isRising ? '#00D66F' : '#F83922';

        ohlc.push({
            x: itemDate,
            open: itemOpen,
            high: itemHigh,
            low: itemLow,
            close: itemClose,
            color: itemColor
        });

        volume.push({
            x: itemDate,
            y: itemVolume,
            color: itemColor
        });
    });


    // create the chart



    Highcharts.theme = {
   colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
      '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
   chart: {
      backgroundColor: "#2f3e47",
      style: {
         fontFamily: '\'Unica One\', sans-serif'
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '20px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3'

         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0'
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: '#F83922',
         color: "#F83922",
         upColor: '#00D66F',
         upLineColor: "#00D66F"
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: 'red',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);


    props.chart = Highcharts.stockChart('container', {

        panning:true,

        rangeSelector: {
            selected: 1
        },

        title: {
            text: currencypair + ' Historical'
        },

        yAxis: [{
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],

        tooltip: {
            split: true,
            enabledIndicators: true
        },

        series: [{
            id: props.seriesCandleId,
            type: 'candlestick',
            name: currencypair,
            data: ohlc,
            dataGrouping: {
                units: groupingUnits,
                enabled: false
            }
        }, {
            id: props.seriesVolumeId,
            type: 'column',
            name: 'Volume',
            data: volume,
            yAxis: 1,
            // upColor:"red"
            dataGrouping: {
                units: groupingUnits,
                enabled: false
            }
        }],

        indicators: [
            getIndicator(props.indicators.options[0].key)
        ],

        chart: {
            events: {
                redraw: onChartRedraw
            }
        }
    } );
});




            }

    /**
     * Handling chart redraw event
     */
    function onChartRedraw() {


        var yAxisWithResizer = this.yAxis.find(function(item) {
            return item.resizer;
        });

        if (!yAxisWithResizer) {
            return;
        }

        var resizer = yAxisWithResizer.resizer,
            topIndent = 20,
            topPos = resizer.lastPos + topIndent;

        // Set position of indicators control
        props.indicators.block.css({ top: topPos });
    }

function renderSellBuyTD(selector, amount, price){

  $(selector).append('<tr id="md-sell-7583-9884" price="'+price+'" amount="19853200" t="sell" style="cursor: pointer;"><td>'+price+'</td><td class="amount"><i class="icn icn-BTC"></i>'+amount+'</td></tr>');
}


function listenForChartUpdate(){

    $('#hello select').on("change", function(){


      $('#containerCoor').hide();

      //if not crypto, do not call this command
      if($('#currencypair').val().indexOf('maybeNotCrypto') !=-1 || $('#exchange').val().indexOf('maybeNotCrypto') !=-1 ){

          if($('#currencypair').val().indexOf('maybeNotCrypto') !=-1 && $('#exchange').val().indexOf('maybeNotCrypto') !=-1 ){

            renderNonExchangeAveragePriceMaybeStock($('#currencypair').val().split('-maybe')[0]);

          }
          else{
            lity('#alertMsg')
            return;
          }

        return;
      }
        showLoading()
        updateCandleChart();
        updateOrderBook(whichExchange, whichCurrency);
        getTicker();
        getNews($('#currencypair').val());

    })
}

  function initNews(){
     whichCurrency = $('#currencypair').val();
     getNews(whichCurrency);

  }

            function initCandleChart(){

                 whichExchange = $('#exchange').val();
                whichCurrency = $('#currencypair').val();
                whichPeriod = $('#period').val();
                renderCandleChart(whichExchange, whichCurrency, whichPeriod);
                renderOrderBook(whichExchange, whichCurrency);
                  getTicker();
            }




            function showLoading(){

                $('#theLoader').fadeIn();
            }

             function hideLoading(){

                $('#theLoader').fadeOut();
            }


          

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

  function userAuth(){

if(localStorage.getItem('oauth') != null && localStorage.getItem('oauth') != ""){
  oauthString = "?oauth="+ localStorage.getItem('oauth') ;
}
else{
  oauthString= "";
}
    $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getUserInfo.php'+oauthString,
      complete:function(transport){

        theResp = $.parseJSON(transport.responseText);
        if(theResp['status'] =='success'){
           $('#user').html('Mock Portfolio: ');
           $('#userBalance').html("$"+ numberWithCommas(parseFloat(theResp.balanceInfo['totalAssets']).toFixed(2)));
          $('#signer').html("<a href='javascript:logout()' style='font-size:12px;opacity:.8;text-decoration:none; color:#fff'>Logout</>");
          $('#signer2').hide();


        }
        else{
          localStorage.setItem('oauth', theResp.user[0]['oauth']);

          $('#userBalance').html("$"+ numberWithCommas(parseFloat(theResp.balanceInfo['totalAssets']).toFixed(2)));
          
          
        }

         $('.fiatAmount').html("$"+numberWithCommas(theResp.balanceInfo['USDBalance'].toFixed(2)));
           $('.portfolioValue').html("$"+numberWithCommas(theResp.balanceInfo['totalAssets'].toFixed(2)));
           assetValue = theResp.balanceInfo['totalAssets'].toFixed(2) - theResp.balanceInfo['USDBalance'].toFixed(2);
          assetValue =  assetValue.toFixed(2);
           $('.assetsAmount').html("$"+numberWithCommas(assetValue));
           $('.assetsChange').html(theResp.balanceInfo['totalReturn'].toFixed(2) +"%");

           for(i in theResp.balanceInfo['cryptocurrencies']){

              oTRSting = ' <tr style="font-weight: 600;color:white;"><td style="width:30%;">'+i.toUpperCase().split('-')[0]+'</td> <td style="width:25%;" class="numberedVar">'+theResp.balanceInfo['cryptocurrencies'][i]+' ($'+(theResp.balanceInfo['cryptoPrices'][i] *theResp.balanceInfo['cryptocurrencies'][i]).toFixed(2) +')</td><td style="font-size: 11px;text-align:center;font-weight: normal;width:15%;color:#15a661;">--%</td><td style="font-size: 11px;text-align:center;font-weight: normal;width:15%;color:#15a661;">--%</td><td style="font-size: 11px;text-align:center;font-weight: normal;width:15%;color:#15a661;" class="numberedVar">'+theResp.balanceInfo['equityGains'][i].toFixed(2)+'%</td></tr>';
              $('.portfolioStats').append(oTRSting )

           }

           setTimeout(function(){
            $('.numberedVar').each(function(){
             
              if($(this).html().indexOf('-')!=-1){
                $(this).css('color', 'red')
              }
            })
           }, 500)

        if(typeof theResp['orders'] == "object"){
          for(i in theResp['orders']){
            thisOrder = theResp['orders'][i];
            renderActiveOrders(thisOrder['rId'], thisOrder['timestamp'], thisOrder['type'], thisOrder['amount'], thisOrder['price'], thisOrder['symbol']);


          }
        }
        


      }
    })
  }


  function circlesNavActivate(){

    $('.checkout-bar li:nth(0)').on('click', function(){
        $('.checkout-bar li').removeClass( 'active');
        $(this).addClass('active');
      $('#mockOrders').hide();
      $('#hello, #container, #indicators_box').show('slow');

      $('#coorContainer1').show()
    })


     $('.checkout-bar li:nth(1)').on('click', function(){

       $('.checkout-bar li').removeClass('active');
           $(this).addClass('active');
      $('#mockOrders').show('slow');
      $('#hello, #container').hide();
      $('.mockButton').show();
      $('.realButton, #indicators_box').hide();

       $('#coorContainer1').hide()
       mixT('visited mock order screen')
    })


        $('.checkout-bar li:nth(2)').on('click', function(){

       $('.checkout-bar li').removeClass('active');
           $(this).addClass('active');
      $('#mockOrders').show('slow');
      $('#hello, #container').hide();
      $('.mockButton, #indicators_box').hide();
      $('.realButton').show();

       $('#coorContainer1').hide()
       mixT('visted real order screen')
    })


  }


  function comingSoon(){

    lity('#comingSoon')
  }



function getRecommendInfo(theSymbolName){
  recommendSymbol = theSymbolName;
     $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getRecommendations.php',
      data:{
        'symbol' : theSymbolName.split('-')[0]
      },
      method:"POST",
      complete:function(transport){

        theRespRecommend = $.parseJSON(transport.responseText);
        
        if(theRespRecommend ['info']['summary']==0){
          $('#tradeRecommend').hide();
        }
        else{
           $('#tradeRecommend').show();
           $('#recSec1').html(theRespRecommend ['info']['html']);
          

        }
      }
    })
  }


  function recUpdate(periodAsk){

    $('#recNav li').removeClass('active');
   $('#recSec1').html('Loading...');
     $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getRecommendations.php',
      data:{
        'symbol' :   recommendSymbol ,
        'period': periodAsk
      },
      method:"POST",
      complete:function(transport){

        theRespRecommend = $.parseJSON(transport.responseText);
        
        if(theRespRecommend ['info']['summary']==0){
          $('#tradeRecommend').hide();
        }
        else{
           $('#tradeRecommend').show();
           $('#recSec1').html(theRespRecommend ['info']['html']);
          

        }
      }
    })

     mixT('updated recommend screen')
  }





  function launchRecommendInfo(){

     lity('#recSection');
     mixT('viewed recommend screen')

  }



  function getMarketCapInfo(theSymbolName){



     $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/getMarketData.php',
      data:{
        'symbol' : theSymbolName.split('-')[0]
      },
      method:"POST",
      complete:function(transport){

        theRespMarket = $.parseJSON(transport.responseText);
        
        if(theRespMarket['marketCap']==0){
          $('#cryptoDetails').hide();
        }
        else{
           $('#cryptoDetails').show();

globalCap =theRespMarket['globalCap'].toFixed(2);

if(theRespMarket['coinChange'] <0){
  $('#coinChange').html( "("+theRespMarket['coinChange'] +"%)").css({'color':'#f05050'});
}
else{
   $('#coinChange').html( "("+theRespMarket['coinChange'] +"%)").css({'color':'#15a661'});
}

           $('#cryptoCap').html("$"+ borm(globalCap));
           
           $('#cryptoVol').html("$" +borm(theRespMarket['daysVolume'] ));
           $('#globalVol').html("$" +borm(theRespMarket['globalVolume'] ));
           $('#theCryptoCap').html("$"+ borm(theRespMarket['marketCap']))
           $('#marketCap').html("$"+ numberWithCommas(theRespMarket['marketCap'].toFixed(0)));
       $('#percOfMarket').html(( theRespMarket['percentageOfTotal'] *100).toFixed(3)+"%");

        }
      }
    })
  }


  function tradeOrderTotalsListen(){



    $('#buyAmount').on('keyup', function(){

      if(isNaN(parseFloat($(this).val())) || isNaN( parseFloat($('#buyPrice').val()))){
        return;
      }

      totalAmount = parseFloat($(this).val()) * parseFloat($('#buyPrice').val());
          $('#tradeTotal').show()
$('#tradeTotal1').show()

      $('#tradeTotal').html('$'+totalAmount)
    })


    $('#buyAmount').on('keyup', function(){

      if(isNaN(parseFloat($(this).val())) || isNaN( parseFloat($('#sellPrice').val()))){
        return;
      }


      $('#tradeTotal').show()
$('#tradeTotal1').show()
      totalAmount = parseFloat($(this).val()) * parseFloat($('#sellPrice').val());

      $('#tradeTotal1').html('$'+totalAmount)
    })


  }

  function getTicker(theCurrencyPair){
     // getMarketCapInfo();
      $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/ticker.php',
      data:{
        'currencypair' : $('#currencypair').val(), 'exchange':$('#exchange').val()
      },
      method:"POST",
      complete:function(transport){

        theRespPair = $.parseJSON(transport.responseText);
        $('#tickerPrice').html(numberWithCommas(parseFloat(theRespPair['ticker']['price']).toFixed(2)));
                $('#buyPrice').val(theRespPair['ticker']['price'].toFixed(2));
        $('#sellPrice').val(theRespPair['ticker']['price'].toFixed(2));



        amountChanged =parseFloat(theRespPair['ticker']['change']);
        percentageChanged = amountChanged/parseFloat(theRespPair['ticker']['price']);
        $('#tickerChange').html( percentageChanged.toFixed(2)+"%");
        $('#tickerCurrency').html($('#currencypair').val().split("USD")[0]);
      }
    })

  }

  function register(){

    if($('#signupEmail').val().length < 5){
      alert("Please enter a valid email")
      return;
    }
     if($('#signupPw').val().length < 2){
      alert("Please enter a valid password")
      return;
    }

    $('#signupForm button').html('signing up...')

    if(localStorage.getItem('oauth') != null && localStorage.getItem('oauth') != ""){
        oauthString = "?oauth="+ localStorage.getItem('oauth') ;
      }
    else{
      oauthString= "";
    }

           $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/register.php'+oauthString,
      data:{
        email:$('#signupEmail').val(),
        pw:$('#signupPw').val()
      },
      method:"POST",
      complete:function(transport){

        theResp = $.parseJSON(transport.responseText);
        if(theResp['status'] =='success'){
          $('#signupForm button').html('Please wait')
          window.location=window.location.href;
              
        }
        else{
          alert("Sorry that email is already taken or invalid.");
          $('#signupForm button').html('Finish')
        }
      }
    })


    }
  

  function login(){


 if($('#loginEmail').val().length < 5){
      alert("Please enter a valid email")
      return;
    }
     if($('#loginPw').val().length < 2){
      alert("Please enter a valid password")
      return;
    }



    $('#loginForm button').html('logging in...')
           $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/login.php',
      data:{
        email:$('#loginEmail').val(),
        pw:$('#loginPw').val()
      },
      method:"POST",
      complete:function(transport){

        theResp = $.parseJSON(transport.responseText);
        if(theResp['status'] =='success'){
          $('#loginForm button').html('Please wait')
     
              
        }
        else{
          alert("Something went wrong. Please try again");
          $('#signupForm button').html('Finish')
        }
      }
    })

  }


  function logout(){
      $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/logout.php',
      complete:function(transport){
        localStorage.setItem('oauth', "");
        window.location=window.location.href;
      }
    })
  
  }
  function renderActiveOrders(orderId, timestamp, type, amount, price, currency){

    theTrString = '<tr id="order-'+orderId+'" class=""><td>'+timestamp+'</td><td><i class="icn-cart-in"></i>'+type+'</td><td><i class="icn icn-BTC"></i>'+amount+'</td><td class="remains"><i class="icn icn-BTC"></i>'+amount+'</td><td>'+price+'</td><td><i class="icn icn-USD"></i>'+currency+'</td><td class="fee"> 0.00 </td><td class="action"><button class="btn btn-red btn-mini" onclick="cancelOrder('+orderId+')"><i class="icn-remove icon-white"></i> Cancel</button></td></tr>';
    $('#orders-tbody').append(theTrString);

  }

  function cancelOrder(orderId){
 
    $('#order-'+orderId).remove();

    $.ajax({
      url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/cancelMockOrder.php?oauth='+localStorage.getItem('oauth')+'&orderId='+orderId,
      complete:function(transport){
        alert("Order Cancelled");
        console.log(transport.responseText);
      }
    })
  }


  function placeMockBuyOrder(){

    $('#mockBuyButton').html("Placing order...");
    buyPrice = $('#buyPrice').val();
    buyAmount= $('#buyAmount').val();
    buySymbol = $('#currencypair').val().split("USD")[0];
    buyType = "buy";

    if(isNaN(buyPrice) || buyPrice==""){
      alert("Please enter a buy price that is a number")
      return;
    }

     if(isNaN(buyAmount || buyAmount=="")){
      alert("Please enter a buy amount that is a number")
      return;
    }

    placeMockOrder(buySymbol, buyPrice, buyAmount, buyType);

  }
  function placeMockSellOrder(){
      $('#mockSellButton').html("Placing order...");
    sellPrice = $('#sellPrice').val();
    sellAmount= $('#sellAmount').val();
   sellSymbol = $('#currencypair').val().split("USD")[0];
   sellType = "sell";


   if(isNaN(sellPrice) || sellPrice==""){
      alert("Please enter a sell price that is a number")
      return;
    }

     if(isNaN(sellAmount) || sellAmount==""){
      alert("Please enter a sell amount that is a number")
      return;
    }

      placeMockOrder(sellSymbol, sellPrice, sellAmount, sellType);
  }

  function placeMockOrder(symbol, price, amount, type){

     if(localStorage.getItem('oauth') != null && localStorage.getItem('oauth') != ""){
       theOrderData= {"symbol":symbol,"price":price,"amount":amount, "type":type, "oauth": localStorage.getItem('oauth')};
      }
    else{
       theOrderData= {"symbol":symbol,"price":price,"amount":amount, "type":type};
    }

      $.ajax({
        url:'https://stark-island-54204.herokuapp.com/cloud/api/beta/createMockOrder.php',
          data:theOrderData,

          complete:function(transport){
             $('#mockBuyButton').html("Placing Mock Order");
             $('#mockSellButton').html("Placing Mock Order");
          
            theResp1 = $.parseJSON(transport.responseText);
            console.log(theResp1);

            if(theResp1['status']=="fail"){
              alert(theResp1['msg']);
              return;
              }
             $('#userBalance').html("$"+ numberWithCommas(theResp1.balanceInfo['totalAssets'].toFixed(2)));

             if(theResp1['filledStatus']=="filled"){
              lity('#instantlyFilled')

             }
             else{

              renderActiveOrders(theResp1['data']['rId'], theResp1['data']['timestamp'], theResp1['data']['type'], theResp1['data']['amount'], theResp1['data']['price'], theResp1['data']['symbol']);
              lity('#pendingOrder');


             }



          }
      })
  }



















  function initList(){
  
  var list = document.querySelector('#list1'),
      form = document.querySelector('#form1'),
      item = document.querySelector('#item');
  
  form.addEventListener('submit',function(e){
    e.preventDefault();
    list.innerHTML += '<li>' + item.value + '</li>';
    store();
    item.value = "";

    mixT('added note')
  },false)
  
  list.addEventListener('click',function(e){
    var t = e.target;
    if(t.classList.contains('checked')){
      t.parentNode.removeChild(t);
        mixT('removed note')
    } else {
      t.classList.add('checked');
        mixT('checked note')
    }
    store();
  },false)
  
  function store() {
    window.localStorage.myitems = list.innerHTML;
  }
  
  function getValues() {
    var storedValues = window.localStorage.myitems;
    if(!storedValues) {
      list.innerHTML = '<li>This is an example note</li>'+
                       '<li>You can add, check or remove these</li>';
                      
    }
    else {
      list.innerHTML = storedValues;
    }
  }
  getValues();
}




function borm (labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
    // Six Zeroes for Millions 
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

    : (Math.abs(Number(labelValue))).toFixed(2);

}


function initHideNewsReel(){
  $('.marquee').on('mouseover', function(){

    $('#hideNewsReel').show();
  })

  $('#hideNewsReel').on('click', function(){
   
     $('.marquee').hide()
  })

   $('#hideNewsReel').on('mouseout', function(){

    $('#hideNewsReel').hide();
  })

     $('.container').on('click', function(){

    $('#hideNewsReel').hide();
  })



}





            