let body = '<body style="color:#666666;"><div​​ ​style="​font-size:10pt;font-family:\'Arial\';"​​>' + rescheduleText + 'Dear Colleagues,​​<p><span>We would like to inform you about planned work on the CID:<br><br> ​' + data['kundenCID'] + '. <br><br>The maintenance work is with the following details:</span></p><table border="0" cellspacing="2" cellpadding="2" width="975"><tr><td>Maintenance ID:</td><td><b>' + maintID + '</b></td></tr><tr><td>Start date and time:</td><td><b>' + startTimeLabel + ' (' + tzSuffixRAW + ')</b></td></tr><tr><td>Finish date and time:</td><td><b>​​​' + endTimeLabel + ' (' + tzSuffixRAW + ')</b></td></tr>'

if (impact !== '') {
  body += '<tr><td>Impact:</td><td>' + impact + '</td></tr>'
}

if (location !== '') {
  body += '<tr><td>Location:</td><td>' + location + '</td></tr>'
}

if (reason !== '') {
  body += '<tr><td>Reason:</td><td>' + reason + '</td></tr>'
}

body += '</table><p>We sincerely regret causing any inconveniences by this and hope for your understanding and the further mutually advantageous cooperation.</p><p>If you have any questions feel free to contact us at maintenance@newtelco.de.</p></div>​​</body>​​<footer>​<style>.sig{font-family:Century Gothic, sans-serif;font-size:9pt;color:#636266!important;}b.i{color:#4ca702;}.gray{color:#636266 !important;}a{text-decoration:none;color:#636266 !important;}</style><div class="sig"><div>Best regards <b class="i">|</b> Mit freundlichen Grüßen</div><br><div><b>Newtelco Maintenance Team</b></div><br><div>NewTelco GmbH <b class="i">|</b> Moenchhofsstr. 24 <b class="i">|</b> 60326 Frankfurt a.M. <b class="i">|</b> DE <br>www.newtelco.com <b class="i">|</b> 24/7 NOC  49 69 75 00 27 30 ​​<b class="i">|</b> <a style="color:#" href="mailto:service@newtelco.de">service@newtelco.de</a><br><br><div><img src="https://home.newtelco.de/sig.png" height="29" width="516"></div></div>​</footer>'

module.exports = { body: body }
