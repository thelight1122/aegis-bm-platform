export default [
    {
        name: 'reverse',
        description: 'Reverses the sequence of characters in the input text.',
        run: async (args: any) => {
            const input = args.text || "";
            return { result: input.split('').reverse().join('') };
        }
    }
];
