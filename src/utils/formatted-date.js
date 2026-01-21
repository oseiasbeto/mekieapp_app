const moment = require("moment");

function formattedDate(date) {
    return moment(date).locale('pt-br').format('D [de] MMMM [de] YYYY [às] HH:mm');
 }

 module.exports = formattedDate