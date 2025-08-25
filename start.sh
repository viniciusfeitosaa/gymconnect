#!/bin/bash

echo "========================================"
echo "    GymConnect - Iniciando Projeto"
echo "========================================"
echo

echo "Instalando dependencias..."
npm run install-all

echo
echo "Iniciando servidor e cliente..."
npm run dev
