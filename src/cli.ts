#!/usr/bin/env node
import yargs from 'yargs';
import AbiToMock from './index';

interface CliArgs {
  abi: string;
  out: string;
  name: string;
}

yargs
  .command<CliArgs>(
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
      try {
        AbiToMock(argv.abi, argv.out, argv.name);
      } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
      }
    }
  )
  .fail((msg, err) => {
    console.error('\x1b[31m%s\x1b[0m', msg || (err instanceof Error ? err.message : 'An unknown error occurred'));
    process.exit(1);
  })
  .help()
  .argv;