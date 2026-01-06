<div align='center'>
    <h1>Factory 3</h1>
    <h3>generate thousands of shell shockers accounts in minutes</h3>
</div>

<br><br>

## What Is Factory V3?
Factory V3 is a complete rewrite of Factory, designed to be faster, more reliable, and easier to use while still making it easy to migrate from the previous Factory version.

Key changes from Factory V2:
- Discord user account scoped bots are now supported
- Slash commands are now the main command structure
- Kiln & Tempmail creation are properly supported
- Ease of use: both invidiual creation & bulk creation
- LTS support (better error handling, less crashes)

<br><br>

## Setup
Setup is a bit complicated.

1. Install [Bun](https://bun.sh), Node.JS is not supported.
2. Setup the env values - `cp example.env .env` and fill in the various values.
    1. `SOCKS_PROXY` - A SOCKS5 or SOCKS5H (https **NOT** supported) proxy to use for account creation.
    2. `GEN_YOLO` - Set to `1` to enable YOLO mode, which prevents the generation process from crashing on errors.
    3. `ALLOWED_USERS` - Comma separated list of Discord user IDs that are allowed to use the bot.
    4. others are self-explanitory

<br>

Factory has 2 modes of email generation:
1. Kiln Assisted
2. Email Service

Kiln Assisted uses [Kiln](https://github.com/VillainsRule/Kiln) to automatically verify emails on your Cloudflare domain (which will get it BL'd). Email Service uses [malq](https://github.com/VillainsRule/malq) to generate temporary email addresses for verification.

<br>

### Kiln Assisted
1. Follow the instructions in the [Kiln README](https://github.com/VillainsRule/Kiln) to setup Kiln on your Cloudflare domain.
2. In `build/providers`, copy `build/providers/example/kiln.ts` to `build/providers/impl/kiln.ts`.
3. Update the new `kiln.ts` file with the `KILN_EMAIL` variable set to your Kiln email address.
4. Modify `build/providers/getProvider.ts` to use the new `kiln.ts` file.
5. Run the script with `bun generate`.

<br>

### Email Service
Comprehensive instructions for email generation have been removed due to the frequent changes in temporary email providers. Please refer to the comments in `build/providers/getProvider.ts` and example at `build/providers/example/tempmail.ts` for guidance on using temporary email providers.

<br><br>

## Usage
Once setup is complete and you've generated some accounts, run the bot with `bun prod`!

<br><br>
<h5 align='center'>made with :heart: by VillainsRule</h5>