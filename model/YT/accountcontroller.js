const Account = require('../../model/YT/account');

const createAccount = async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

const updateaccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update account' });
    }
};

const deleteaccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
const getaccountbyname = async (req, res) => {
    try {
        const account = await Account.findOne({ accountname: req.params.name });
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json(account);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get account' });
    }
};
module.exports = { createAccount, updateaccount, deleteaccount, getaccountbyname };