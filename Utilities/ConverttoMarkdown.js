const md = require('markdown-it')();
const moment = require('moment');

class ConverttoMarkdown {
    static ConverttoMarkdown(blogs) {
        let blogsInProcess = Array.isArray(blogs) ? blogs : [blogs];
        for (let i in blogsInProcess) {
            blogsInProcess[i].time = moment(blogsInProcess[i].dateCreated).format("DD/MM/YYYY");
            blogsInProcess[i].content = md.render(blogsInProcess[i].content).split('\n').join('')
        }
    }
}

module.exports = ConverttoMarkdown;