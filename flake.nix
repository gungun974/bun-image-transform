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

      version = "1.1.1";

      node_modules = pkgs.stdenv.mkDerivation {
        pname = "bun-image-transform-node_modules";
        src = gitignore.lib.gitignoreSource ./.;
        inherit version;
        impureEnvVars =
          pkgs.lib.fetchers.proxyImpureEnvVars
          ++ ["GIT_PROXY_COMMAND" "SOCKS_SERVER"];
        nativeBuildInputs = [pkgs.bun];
        dontConfigure = true;
        buildPhase = ''
          bun install --no-progress --frozen-lockfile
        '';
        installPhase = ''
          mkdir -p $out/node_modules

          cp -R ./node_modules $out
        '';
        outputHash = "sha256-pYCXPu22HxHJwCbETD8fDSU0eyoZUJUDuZGNax/YLew=";
        outputHashAlgo = "sha256";
        outputHashMode = "recursive";
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
