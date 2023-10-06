{
  description = "Nix development shell for bun";

  inputs = {
    # Nixpkgs
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: {
    devShell.x86_64-linux = let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;

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
        packages = [
          FHSBun
        ];
      };
  };
}
