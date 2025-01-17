const yargs = require('yargs');
const AbiToMock = require('./index');
const path = require('path');

yargs
  .command(
    '$0 <abi>',
    'Generate mocks from ABI',
    (yargs) => {
      yargs
        .positional('abi', {
          describe: 'Path to the ABI file',
          type: 'string',
        })
        .option('out', {
          alias: 'o',
          describe: 'Output directory for the generated mocks',
          type: 'string',
          default: './out'
        })
        .option('name', {
          alias: 'n',
          describe: 'Contract name (without Mock suffix)',
          type: 'string',
          default: 'ContractMock'
        });
    },
    (argv) => {
      const { abi, out, name } = argv;
      AbiToMock(abi, out, name);
    }
  )
  .help()
  .argv;