# Release 1.0.21 

  >Cumulative changes since version 1.0.4 comprising new features/enhancements and fixes are included in these release notes.

## New Features/Enhancements
- **Support for Standing Order and Future-dated Payments** 
  >Provides the mechanism for a PSU to specify payment(s) for a specific amount to a designated payee on a specified future date or regularly scheduled basis under a common `CreateAndEndorseToken` flow with the following attributes and distinctions:
  >  - **Standing Order**
  >    - A new `StandingOrder` payload is now supported in `TokenRequest` based on a defined schedule.
  >    - A new confirmation screen prompt displays "Approve Standing Order."
  >    - The `StandingOrder` payload content is displayed in the details screen
  >  - **Future-dated Payments**
  >    - A field execution date can now specified for a transaction payload created in `TokenRequest`.
  >    - The `StandingOrder` payload content is displayed in the details screen.
  
- **Interim eIDAS Validation**
  > Under PSD2 rules, in addition to fulfilling host country business licensing mandates, all third-party providers (TPPs)  must use validated eIDAS certificates from a Qualified Trust Service Provider (QTSP) for their service requests to PSD2-enabled banks (ASPSPs). 
  >
  > Effective 14 September 2019, under arrangement with its PSD2-enabled banks, Token now electronically checks all TPPs against the records of their respective eIDAS certificate provider and the European Banker's Association (EBA) directory. A valid certificate and a valid business license are both required to pass these checks.
  >
  > Token verification checks occur on the following schedule:
    > - During TPP onboarding before final approval for production. This initial check ensures that each TPP and its required licenses and certificates are valid and eligible to connect with Token PSD2-enabled banks in the geography associated with the connection request. Token will approve/decline the respective TPP for production based on the result of this check.
    > - Once a TPP has been promoted to production, automated TPP validation checks are performed no less than 4 times per business day (GMT 0700-1800). Should an intraday validation check fail, subsequent service requests will be declined, pending reinstatement of the TPP's certificate or license in question.
    
- **Support for Bulk Transfers**
  > A bulk transfer (or bulk payment) is a group of payments -- in a file, for example -- to be made to multiple creditor accounts from a single debtor account on the same day/date using the same currency under a common payment scheme. PSU authentication of a bulk transfer is essentially the same as authentication of a single credit transfer when supplemental information is displayed; i.e. if the payment order is incomplete.
