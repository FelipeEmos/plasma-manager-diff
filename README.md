# Plasma Manager DIFF

This is a CLI that uses plasma-manager
https://github.com/nix-community/plasma-manager

In a fixed interval of time and computes what has changed, which is super useful to isolate only the properties that interest you.

You can think of it like "recording changes" in your plasma settings and conveniently outputing such changes in a file.

If the `file` you chose to output the changes is already a ".nix" configuration file, than keep it simple ( something translatable to JSON ) cus the tool will APPLY the changes in your config for convenience!


## Usage
```bash
plasma-manager-diff watch
```
To use it with a target nix file, the output will be applied in your ".nix" config file

```bash
plasma-manager-diff watch --file ~/.dotfiles/plasma/your-basic-plasma-config.nix
```

### File Limitation
Your NIX file must be simple attribute set, in other words: mappable to JSON

A Workaround for the limitation:
```nix
let
  # Import base configuration from external file
  # This is good because this file can be super simple
  baseConfig = import ./your-basic-plasma-config.nix;
in
{
  config = {
    # Recursively merge base config with custom overrides
    programs.plasma = lib.recursiveUpdate baseConfig.programs.plasma {
      enable = true;
      workspace = {
        clickItemTo = "select";
        # This could be a dynamic value, for exemple, it's up to you
        wallpaper = "/path/to/wallpaper.png";
      };
      shortcuts = { };
    };
  };
}
```


## Installation - NIXOS

#### Without Home Manager

Add `plasma-manager-diff` to your flake inputs:

```nix
inputs = {
  nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  plasma-manager-diff = {
    url = "github:FelipeEmos/plasma-manager-diff";
    inputs.nixpkgs.follows = "nixpkgs";
  };
};
```

Then add it to your `environment.systemPackages` in your NixOS configuration:

```nix
environment.systemPackages = [
  inputs.plasma-manager-diff.packages.${pkgs.system}.default
];
```

#### With Home Manager

Add `plasma-manager-diff` to your flake inputs:

```nix
inputs = {
  nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  home-manager = {
    url = "github:nix-community/home-manager";
    inputs.nixpkgs.follows = "nixpkgs";
  };
  plasma-manager-diff = {
    url = "github:FelipeEmos/plasma-manager-diff";
    inputs.nixpkgs.follows = "nixpkgs";
  };
};
```

Then add the package to your home-manager configuration:

```nix
home.packages = [
  inputs.plasma-manager-diff.packages.${pkgs.system}.default
];
```


## Build

```bash
nix install
```
Your executable file will appear in ./result/bin/plasma-manager-diff

## Dev

Use `direnv` to setup the correct dependencies and you're ready.
Run
```bash
bun dev
```
To execute the script in development
