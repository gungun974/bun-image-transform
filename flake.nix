{
  description = "Nix development shell for bun";

  inputs = {
    # Nixpkgs
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    flake-utils.url = "github:numtide/flake-utils";

    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ {
    nixpkgs,
    gitignore,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
      };

      version = "1.1.2";

      node_modules = pkgs.mkYarnModules {
        pname = "bun-image-transform-node_modules";
        inherit version;
        packageJSON = ./package.json;
        yarnLock = ./yarn.lock;
      };
    in {
      packages = {
        default = pkgs.stdenv.mkDerivation {
          pname = "bun-image-transform";
          inherit version;
          src = gitignore.lib.gitignoreSource ./.;
          nativeBuildInputs = [pkgs.makeBinaryWrapper];

          dontConfigure = true;
          dontBuild = true;

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin

            ln -s ${node_modules}/node_modules $out

            ${pkgs.bun}/bin/bun run ./build.ts

            cp -R ./dist/* $out

            # bun is referenced naked in the package.json generated script
            makeBinaryWrapper ${pkgs.bun}/bin/bun $out/bin/bun-image-transform \
              --prefix PATH : ${pkgs.lib.makeBinPath [pkgs.bun]} \
              --prefix LD_LIBRARY_PATH : ${pkgs.lib.makeLibraryPath [pkgs.vips pkgs.stdenv.cc.cc]} \
              --add-flags "run --prefer-offline --no-install $out/cli.js"

            runHook postInstall
          '';
        };
      };

      devShell = let
        FHSBun =
          pkgs.buildFHSEnv
          {
            name = "bun";

            targetPkgs = pkgs: [
              pkgs.bun
            ];

            runScript = "${pkgs.bun}/bin/bun";
          };
      in
        pkgs.mkShell {
          shellHook = ''
            export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${pkgs.lib.makeLibraryPath [pkgs.vips pkgs.stdenv.cc.cc]}
          '';

          packages = [
            FHSBun
          ];
        };
    });
}
