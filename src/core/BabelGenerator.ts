import generate from '@babel/generator';
export default {
    generate: (ast) => generate(ast, {
        plugins: [
            // enable jsx and flow syntax
            "jsx",
            "flow"
        ]
    })
}
