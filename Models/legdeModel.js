const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ledgerBookSchema = new Schema({
    Order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    transactions:{
       type:String,
        required:true,
    },
    balance: {
        type: Number,
        default: 0
    },
    debit: {
        type: Number,
        default: 0
    },
    credit: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Ledgerbook = mongoose.model('LedgerBook', ledgerBookSchema);

module.exports = Ledgerbook;
