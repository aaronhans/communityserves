
const asObject = function asObject(array, prop){
    return array.reduce((result, item, index) => {
        let key = prop || index;
        // TODO: strip spaces.  Remove when ids are fixed
        result[item[key].replace(/ /g, "")] = item;
        return result;
    }, {});
}

const formatRequests = function formatRequests(requests){
    return asObject(requests, 'id');
}

const formatDate = function formatDate(date){
    if (!date) return;
    date = new Date(date);
    var hours = date.getHours() <= 12 ?  date.getHours() : date.getHours() - 12;
    var month = date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1;
    var day = date.getDate()+1 < 10 ? '0' + (date.getDate()+1) : date.getDate()+1;
    return date ? `${month}/${day} &middot; ${hours}:${date.getMinutes()}`: '';
}
export default {
    asObject,
    formatDate,
    formatRequests
};