import * as shell from "shelljs";

shell.rm(".env");
if(shell.test("-e", ".env.backup")) {
    shell.cp(".env.backup", ".env");
    shell.rm(".env.backup");
}
