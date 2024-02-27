const SignalResult = require('../../dict/signal_result');

module.exports = class EMATrapCatcher {
  getName() {
    return 'ema_trap_catcher';
  }

  buildIndicator(indicatorBuilder, options) {
    // basic price normalizer
    indicatorBuilder.add('ema', 'ema', options.period, {
      length: options.ema || 200,
      source: options.ema_candle_source || 'close'
    });

  }

  period(indicatorPeriod) {
    const currentValues = indicatorPeriod.getLatestIndicators();
    const candles = indicatorPeriod.getIndicator('candles').slice(-11);
    const ema = indicatorPeriod.getIndicator('ema').slice(-11);

    const emptySignal = SignalResult.createEmptySignal(currentValues);
    if (!ema[0]) {
      return emptySignal;
    }

    const lastSignal = indicatorPeriod.getLastSignal();
    let crossOver;
    let crossOverCandle;
    let crossDown;
    let crossDownCandle;

    for(let i=1; i<candles.length; i++) {
      if(ema[i-1] > candles[i-1].close && ema[i] < candles[i].close){
        crossOver = true;
        crossOverCandle = candles[i];
      }
      if (ema[i-1] < candles[i-1].close && ema[i] > candles[i].close) {
        crossDown = 1;
        crossDownCandle = candles[i];
      }
    }

    if(crossOverCandle){
      emptySignal.addDebug('crossOver:',new Date(crossOverCandle.time*1000).toString());
    }
    if(crossDownCandle){
      emptySignal.addDebug('crossDown:',new Date(crossDownCandle.time*1000).toString());
    }

    if(crossDownCandle && crossOverCandle) {
      if(crossDownCandle.time > crossOverCandle.time){
        emptySignal.addDebug('trend', "Short");
        if (!lastSignal) {
          emptySignal.addDebug('message', 'short_lower_cross');
          emptySignal.setSignal('short');
        } else if (lastSignal) {
          emptySignal.setSignal('close');
          emptySignal.addDebug('message', 'short_lower_cross');
          emptySignal.setSignal('short');
        }
      } else {
        emptySignal.addDebug('trend', "Long");
        if (!lastSignal) {
          emptySignal.addDebug('message', 'long_lower_cross');
          emptySignal.setSignal('long');
        } else if (lastSignal) {
          emptySignal.setSignal('close');
          emptySignal.addDebug('message', 'long_lower_cross');
          emptySignal.setSignal('long');
        }
      }
    } 

    return emptySignal;
  }

  getBacktestColumns() {
    return [
      // {
      //   label: 'crossover',
      //   value: row => {
      //     if (!row.ema) {
      //       return undefined;
      //     }

      //     if (row.ema < row.close) {
      //       return 'success';
      //     }

      //     if (row.hma > row.bb.upper) {
      //       return 'danger';
      //     }

      //     return undefined;
      //   },
      //   type: 'icon'
      // },
      // {
      //   label: 'trend',
      //   value: row => {
      //     if (typeof row.trend !== 'boolean') {
      //       return undefined;
      //     }

      //     return row.trend === true ? 'success' : 'danger';
      //   },
      //   type: 'icon'
      // },
      // {
      //   label: 'message',
      //   value: 'message'
      // }
    ];
  }

  getOptions() {
    return {
      period: '15m',
      ema : 200,
      ema_candle_source: 'close'
    };
  }
};
