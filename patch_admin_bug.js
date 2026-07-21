const fs = require('fs');

// The bug is because I used 'currentPassword' in the headers for 'admin/ambassadors' and 'admin/ambassador/keys'
// but the actual variable in admin.html is called 'adminPass'

let admin = fs.readFileSync('admin.html', 'utf8');
admin = admin.replace(/currentPassword/g, "adminPass");
fs.writeFileSync('admin.html', admin);
