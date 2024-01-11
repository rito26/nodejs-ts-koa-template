import * as shell from "shelljs";

shell.cp("rr.env", "tt.env");
shell.rm("rr.env");