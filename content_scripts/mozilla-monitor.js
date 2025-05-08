const W = window
const D = W.document
const C = chrome

const extractExposureInfo = dlElm => {
  const attrs = new Map()
  let lastAttr = null
  let lastValue = null

  for (const childElm of dlElm.children) {
    const thisElmText = childElm.innerText.trim()
    if (lastAttr === null) {
      lastAttr = thisElmText
    } else {
      lastValue = thisElmText
      if (lastValue.length > 0) {
        attrs[lastAttr] = lastValue
      }
      lastAttr = null
      lastValue = null
    }
  }
  return attrs
}


const extractStatInfo = dlElm => {
  const attrs = new Map()
  let lastAttr = null
  let lastValue = null

  for (const childElm of dlElm.children) {
    const thisElmText = childElm.innerText.trim()
    if (lastValue === null) {
      lastValue = thisElmText
    } else {
      lastAttr = thisElmText
      if (lastAttr.length > 0) {
        attrs[lastAttr] = lastValue
      }
      lastAttr = null
      lastValue = null
    }
  }
  return attrs
}

const onFixedTabClicked = _ => {
  // Extract data broker progress data
  const exposureCardListElms = D.querySelectorAll('dl[class^=ExposureCard_exposureHeaderList]')
  const allAttrData = Array.from(exposureCardListElms).map(extractExposureInfo)
  

  // Extract stat data
  const progressCardListElms = D.querySelectorAll('div[class^=ProgressCard_progressItem]')
  const allStatData = Array.from(progressCardListElms).map(extractStatInfo)
  let mergedStat = {};
  allStatData.forEach(item => {
    let key = Object.keys(item)[0];
    mergedStat[key] = item[key];
  });
  
  const msg = {
    site: 'mozilla-monitor.org',
    data: allAttrData,
    stat: mergedStat
  }
  C.runtime.sendMessage(msg)
}

const fixedTabElm = D.querySelector('nav[class^=Toolbar_toolbar_] div[data-key=fixed]')
fixedTabElm.addEventListener('click', onFixedTabClicked, false)