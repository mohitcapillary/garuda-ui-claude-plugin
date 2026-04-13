# Integration Patches — Benefits Settings

Phase 5c: hld-to-code edits applied to complete Redux wiring and i18n.
(figma-to-component was unavailable; hld-to-code authored UI directly per fallback rules.)

## app/components/pages/BenefitsSettings/BenefitsSettings.js

+ imports: connect, compose, bindActionCreators, createStructuredSelector, injectReducer, injectSaga, withStyles, injectIntl, clearDataOnUnmount
+ imports: all selector factories (16 selectors)
+ imports: actions barrel (*)
+ mapStateToProps: 13 selectors wired (programs from Cap/selectors + 12 benefits-settings selectors)
+ mapDispatchToProps: bound actions via bindActionCreators(actions, dispatch)
+ export: compose(withReducer, withSaga, withConnect)(clearDataOnUnmount(injectIntl(withStyles(BenefitsSettings, styles)), 'clearBenefitsSettingsData'))
- interaction "Page mounts → GET_CUSTOM_FIELDS_REQUEST": wired via useEffect → dispatchedActions.getCustomFieldsRequest (HLD screen.interactions[0])
- interaction "Page mounts → GET_CATEGORIES_REQUEST": wired via useEffect → dispatchedActions.getCategoriesRequest (HLD screen.interactions[1])
+ PropTypes: 14 props declared with correct types
+ defaultProps: all optional props defaulted

## app/components/organisms/CustomFieldsSection/index.js

- callback "Click New custom field → local state": handleNewCustomField opens modal (HLD screen.interactions[2])
- callback "Submit create → CREATE_CUSTOM_FIELD_REQUEST": handleModalSave → onCreate (HLD screen.interactions[3])
- callback "Click edit → local state": handleEditCustomField opens modal with pre-fill (HLD screen.interactions[4])
- callback "Submit edit → UPDATE_CUSTOM_FIELD_REQUEST": handleModalSave → onUpdate (HLD screen.interactions[5])
- callback "Click delete → local state": handleDeleteCustomField opens confirm modal (HLD screen.interactions[6])
- callback "Confirm delete → DELETE_CUSTOM_FIELD_REQUEST": handleConfirmDelete → onDelete (HLD screen.interactions[7])
- callback "Sort change → SET_CUSTOM_FIELDS_SORT + re-fetch": handleTableChange → onSort (HLD screen.interactions[14])
+ All strings replaced with formatMessage(messages.*) calls
+ useEffect hooks watching createCustomFieldStatus/updateCustomFieldStatus/deleteCustomFieldStatus for modal close

## app/components/organisms/CategoriesSection/index.js

- callback "Click New category → local state": handleNewCategory opens modal (HLD screen.interactions[8])
- callback "Submit create → CREATE_CATEGORY_REQUEST": handleModalSave → onCreate (HLD screen.interactions[9])
- callback "Click edit → local state": handleEditCategory opens modal with pre-fill (HLD screen.interactions[10])
- callback "Submit edit → UPDATE_CATEGORY_REQUEST": handleModalSave → onUpdate (HLD screen.interactions[11])
- callback "Click delete → local state": handleDeleteCategory opens confirm modal (HLD screen.interactions[12])
- callback "Confirm delete → DELETE_CATEGORY_REQUEST": handleConfirmDelete → onDelete (HLD screen.interactions[13])
- callback "Sort change → SET_CATEGORIES_SORT + re-fetch": handleTableChange → onSort (HLD screen.interactions[14])
+ All strings replaced with formatMessage(messages.*) calls

## app/components/molecules/BenefitsSettingsModal/index.js

+ Client-side validation: name required, dataType required on create, clear errors on change
+ i18n: all labels, placeholders, error messages via formatMessage(messages.*)
+ CapSelect disabled on EDIT mode (dataType is immutable per HLD validation rules)
+ destroyOnClose on CapModal clears form state

## app/services/api.js

+ mock import block moved to top of file (was incorrectly placed inline)
+ 8 new exported functions appended (getBenefitsCustomFields...deleteBenefitCategory)
+ USE_MOCK_BENEFITS_SETTINGS flag: true (all 8 ASSUMED endpoints backed by mock)
+ Mock functions imported from ./benefits-settings.mock

## app/services/benefits-settings.mock.js (new file)

+ 8 mock functions matching real service return shape (prepareSuccess wrapper)
+ Mock data matches api-contract.json mockResponse schemas
