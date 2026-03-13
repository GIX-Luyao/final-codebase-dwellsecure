#!/bin/bash

echo "Installing Homebrew (this will ask for your password)..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo ""
echo "Adding Homebrew to PATH..."
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

echo ""
echo "Installing Node.js..."
brew install node

echo ""
echo "Verifying installation..."
node --version
npm --version

echo ""
echo "✅ Node.js installation complete!"
echo "You may need to restart your terminal or run: source ~/.zshrc"

