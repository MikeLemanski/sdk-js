/* eslint-disable new-cap */
const chai = require('chai');
const assert = chai.assert;

import 'babel-regenerator-runtime';
import CreateMemberSample from '../../src/sample/CreateMemberSample';
import LinkMemberAndBankSample from '../../src/sample/LinkMemberAndBankSample';
import CreateAndEndorseTransferTokenSample
  from '../../src/sample/CreateAndEndorseTransferTokenSample';
import CancelTransferTokenSample from '../../src/sample/CancelTransferTokenSample';

describe('CancelTransferTokenSample test', () => {
    it('Should run the sample', async () => {
        const member = await CreateMemberSample();
        const member2 = await CreateMemberSample();
        await LinkMemberAndBankSample(member);
        await LinkMemberAndBankSample(member2);

        const member2Alias = {type: 'USERNAME', value: await member2.firstAlias()};
        const res = await CreateAndEndorseTransferTokenSample(member, member2Alias);
        const res2 = await CancelTransferTokenSample(member, res.id);
        assert.equal(res2.status, 'SUCCESS');
    });
});