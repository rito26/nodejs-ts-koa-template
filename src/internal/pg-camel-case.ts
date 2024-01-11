
function snakeToCamel(snakeCase: string){

    if(snakeCase.indexOf("_") < 0)
        return snakeCase;
  
    const tokens = snakeCase.split(/_+/).filter(function(token){
      return (token.length >= 1);
    });
  
    if (tokens.length <= 1) {
      return snakeCase;
    }
  
    const first = tokens.shift().toLowerCase();
    const rest = tokens.map(function(token){
      return token.charAt(0).toUpperCase().concat(
        token.substring(1).toLowerCase()
      );
    }).join("");
  
    return first.concat(rest);
};

export function handlePgSnakeFieldsToCamel(pg: any) {
    const proto = pg?.Client?.Query?.prototype;
    if(proto) {
        const handleRowDesc = proto.handleRowDescription;

        proto.handleRowDescription = function(msg: any) {
            msg.fields.forEach(function(field: any){
                field.name = snakeToCamel(field.name);
            });
            return handleRowDesc.call(this, msg);
        };
    }
}