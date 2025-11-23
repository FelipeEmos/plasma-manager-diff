# plasma-manager-diff

This is a CLI that uses plasma-manager
https://github.com/nix-community/plasma-manager

In a fixed interval of time and computes what has changed, which is super useful to isolate only the properties that interest you.

You can think of it like "recording changes" in your plasma settings and conveniently outputing such changes in a file.

If the `file` you chose to output the changes is already a ".nix" configuration file, than keep it simple ( something translatable to JSON ) cus the tool will APPLY the changes in your config for convenience!


### Installation

```bash
nix install
```
Your executable file will appear in ./result/bin/plasma-manager-diff

### Dev

Use `direnv` to setup the correct dependencies and you're ready.
Run
```bash
bun dev
```
To execute the script in development
