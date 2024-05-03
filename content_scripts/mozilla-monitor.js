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

const onFixedTabClicked = _ => {
  const exposureCardListElms = D.querySelectorAll('dl[class^=ExposureCard_exposureHeaderList]')
  const allAttrData = Array.from(exposureCardListElms).map(extractExposureInfo)
  const msg = {
    site: 'mozilla-monitor.org',
    data: allAttrData
  }
  C.runtime.sendMessage(msg)
}

const fixedTabElm = D.querySelector('nav[class^=Toolbar_toolbar_] div[data-key=fixed]')
fixedTabElm.addEventListener('click', onFixedTabClicked, false)