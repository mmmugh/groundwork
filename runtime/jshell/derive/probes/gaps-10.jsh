# G19: a refused /exit's snippet under /reload, /list and /drop; an import as the start of a /drop range
/exit "s"

int k = 1

/list

/reload

/list

/vars

import java.util.*;

int m = 2

/drop 4-5

/list -all
