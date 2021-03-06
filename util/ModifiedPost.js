const emoji = require('markdown-it-emoji');
const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(emoji);

const moment = require('moment');
const StringProcess = require('./StringProcess');
const removeMd = require('remove-markdown');

class ModifiedPost {
  static addProperties(blogs) {
    let blogsInProcess = Array.isArray(blogs) ? blogs : [blogs];
    for (let i in blogsInProcess) {
      blogsInProcess[i].previewConent = removeMd(blogsInProcess[i].content.split('\n')[0]);
      blogsInProcess[i].time = moment(blogsInProcess[i].dateCreated).format("DD/MM/YYYY");
      if (blogsInProcess[i].latestModified) {
        blogsInProcess[i].modified = moment(blogsInProcess[i].latestModified).format("DD/MM/YYYY");
      }
      blogsInProcess[i].content = md.render(blogsInProcess[i].content).split('\n').join('');
      blogsInProcess[i].titleWithoutAccentAndSpace = StringProcess.toUrlString(blogsInProcess[i].title);
    }
  }
}

module.exports = ModifiedPost;