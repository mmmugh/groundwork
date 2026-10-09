# G22: /reload -restore before any restart, after a /reload, and after a /reset of an empty session
/reload -restore

int a = 1

/reload -restore

/vars

/reload

/reload -restore

/vars

/reset

/reload -restore

/vars

/reset

/reset

/reload -restore

/vars
