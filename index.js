#!/usr/bin/env node
const { Command } = require('commander')
const chalk = require('chalk')
const Thine = require('thine-core')
const fse = require('fs-extra')
const path = require('path')
const parseIgnore = require('parse-gitignore')

const log = console.log

cli()

function cli () {
  const program = new Command()
  program.version('0.0.1')
  program
    .command('publish')
    .description('publish a package')
    .action(() => publish())
  program
    .command('update')
    .description('update a package')
    .action(() => update())
  program
    .command('swarm')
    .description('start swarming')
    .action(() => swarm())
  program
    .command('install')
    .description('install dependencies')
    .action(() => install())
  program.parse(process.argv)
}

async function publish () {
  const dir = process.cwd()
  const thine = new Thine()
  await thine.ready()
  const pack = await thine.publish(dir, { filterPatterns: await readIgnore(dir) })
  log(chalk.greenBright('Successfully published!'))
  log()
  log(chalk.greenBright('Key: ' + chalk.underline(pack.key.toString('hex'))))
}

async function swarm () {
  const thine = new Thine()
  await thine.ready()
  log(chalk.greenBright('Swarming...'))
}

async function update () {
  const dir = process.cwd()
  const thine = new Thine()
  await thine.ready()
  await thine.update(dir, { filterPatterns: await readIgnore(dir) })
  log(chalk.greenBright('Successfully updated!'))
}

async function install () {
  const dir = process.cwd()
  const thine = new Thine()
  await thine.ready()
  await thine.install(dir)
  log(chalk.greenBright('Successfully installed dependencies!'))
}

async function readIgnore (dir) {
  const thineIgnorePath = await fse.pathExists(path.join(dir, '.thineignore'))
  const gitIgnorePath = await fse.pathExists(path.join(dir, '.gitignore'))
  const thineIgnoreExists = await fse.pathExists(thineIgnorePath)
  const gitIgnoreExists = await fse.pathExists(gitIgnorePath)
  let ignore = null
  if (thineIgnoreExists) {
    ignore = await fse.readFile(thineIgnorePath).then(buffer => parseIgnore(buffer))
  } else if (gitIgnoreExists) {
    ignore = await fse.readFile(gitIgnorePath).then(buffer => parseIgnore(buffer))
  }
  return ignore
}
