import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as sideBar from '../pages/sidebar.pages.js'
import * as navigation from '../pages/navigation.page.js'
import * as ls from '../../support/localstorage_data.js'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const addedOwner = 'Added owner'
const addedNonowner = 'Added non-owner'

describe('Sidebar non-owner tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.homeUrl + staticSafes.SEP_STATIC_SAFE_13)
    cy.wait(2000)
    cy.clearLocalStorage()
    main.acceptCookies()
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set3)
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.addedSafes)
  })

  it('Verify New Transaction button enabled for users with Spending limits allowed', () => {
    navigation.verifyTxBtnStatus(constants.enabledStates.enabled)
  })

  // TODOD: Waiting for endpoint from CGW
  it.skip('Verify tag counting queue tx show for owners and non-owners', () => {
    sideBar.openSidebar()
    sideBar.verifyQueuedTx(addedOwner).contains(2)
    sideBar.verifyQueuedTx(addedNonowner).contains(2)
  })
})
