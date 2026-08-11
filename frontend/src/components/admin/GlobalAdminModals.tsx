import React from 'react';
import { BalanceAdjustmentModal } from './modals/BalanceAdjustmentModal';
import { PayoutModal } from './modals/PayoutModal';
import { NewNetworkModal } from './modals/NewNetworkModal';
import { EditNetworkModal } from './modals/EditNetworkModal';
import { NewUserModal } from './modals/NewUserModal';
import { InspectApplicationModal } from './modals/InspectApplicationModal';
import { WhatsappConnectModal } from './modals/WhatsappConnectModal';
import { RequestModificationModal } from './modals/RequestModificationModal';
import { WhatsappModifyRequestModal } from './modals/WhatsappModifyRequestModal';
import { InspectDataEditReqModal } from './modals/InspectDataEditReqModal';
import { InspectNetworkModal } from './modals/InspectNetworkModal';

export const GlobalAdminModals = () => {
  return (
    <>
      <BalanceAdjustmentModal />
      <PayoutModal />
      <NewNetworkModal />
      <EditNetworkModal />
      <NewUserModal />
      <InspectApplicationModal />
      <WhatsappConnectModal />
      <RequestModificationModal />
      <WhatsappModifyRequestModal />
      <InspectDataEditReqModal />
      <InspectNetworkModal />
    </>
  );
};
