{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    plasma-manager = {
      url = "github:nix-community/plasma-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-substituters = [
      "https://cache.nixos.org"
      "https://nix-community.cachix.org"
    ];
    extra-trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  outputs =
    {
      nixpkgs,
      plasma-manager,
      bun2nix,
      ...
    }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: function nixpkgs.legacyPackages.${system}
        );
    in
    {
      formatter = forAllSystems (pkgs: pkgs.alejandra);

      packages = forAllSystems (
        pkgs:
        let
          system = pkgs.system;
          bun2nixPkg = bun2nix.packages.${system}.default;
        in
        {
          default = pkgs.callPackage (
            { bun2nix, makeWrapper, ... }:
            bun2nix.mkDerivation {
              pname = "plasma-manager-diff";
              version = "0.0.1";
              src = ./.;

              bunDeps = bun2nix.fetchBunDeps {
                bunNix = ./bun.nix;
              };

              module = "src/index.ts";

              nativeBuildInputs = [
                makeWrapper
              ];

              buildInputs = [
                plasma-manager.packages.${system}.default
              ];

              postBuild = ''
                bun build ./src/index.ts \
                  --outfile plasma-manager-diff \
                  --target bun \
                  --minify
                chmod +x plasma-manager-diff
              '';

              installPhase = ''
                mkdir -p $out/bin
                cp plasma-manager-diff $out/bin/
                wrapProgram $out/bin/plasma-manager-diff \
                  --prefix PATH : ${
                    pkgs.lib.makeBinPath [
                      plasma-manager.packages.${system}.default
                    ]
                  }
              '';

              meta = with pkgs.lib; {
                description = "plasma-manager that reviews state and accumulates diffs";
                homepage = "https://github.com/FelipeEmos/plasma-manager-diff";
                license = licenses.mit;
                mainProgram = "plasma-manager-diff";
              };
            }
          ) { bun2nix = bun2nixPkg; };
        }
      );

      devShells = forAllSystems (
        pkgs:
        let
          system = pkgs.system;
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              bun
              bun2nix.packages.${system}.default
              plasma-manager.packages.${system}.default
            ];
          };
        }
      );
    };
}
