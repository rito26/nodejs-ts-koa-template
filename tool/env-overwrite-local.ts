import * as shell from "shelljs";

if(shell.test("-e", ".env")) {
    shell.cp(".env", ".env.backup");
    shell.rm(".env");
}
shell.cp(".env.local", ".env");