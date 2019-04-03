const md = require('markdown-it')();
const moment = require('moment');
const StringProcess = require('./StringProcess')

class ModifiedPost {
  static addProperties(blogs) {
    let blogsInProcess = Array.isArray(blogs) ? blogs : [blogs];
    for (let i in blogsInProcess) {
      blogsInProcess[i].time = moment(blogsInProcess[i].dateCreated).format("DD/MM/YYYY");
      blogsInProcess[i].content = md.render(blogsInProcess[i].content).split('\n').join('');
      blogsInProcess[i].titleWithoutAccentAndSpace = StringProcess.toUrlString(blogsInProcess[i].title);
      blogsInProcess[i].previewConent = /[^[>]+(?=<)/g.exec(blogsInProcess[i].content.split('\n')[0])[0] + '...';
    }
  }
}

module.exports = ModifiedPost;