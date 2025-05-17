"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ROICalculator() {
  // State untuk jenis kalkulasi yang dipilih
  const [calculationType, setCalculationType] = useState<string>("roi")

  // State untuk form ROI
  const [roiForm, setRoiForm] = useState({
    propertyPrice: "",
    additionalCosts: "",
    monthlyRent: "",
    propertyTax: "",
    maintenanceCost: "",
    insurance: "",
    investmentPeriod: "",
    sellingPrice: "",
  })

  // State untuk form Cap Rate
  const [capRateForm, setCapRateForm] = useState({
    propertyPrice: "",
    monthlyRent: "",
    yearlyOperationalCosts: "",
  })

  // State untuk form Cash-on-Cash
  const [cashOnCashForm, setCashOnCashForm] = useState({
    cashInvested: "",
    monthlyRent: "",
    yearlyOperationalCosts: "",
    yearlyMortgagePayment: "",
  })

  // State untuk hasil perhitungan
  const [roiResult, setRoiResult] = useState<any>(null)
  const [capRateResult, setCapRateResult] = useState<number | null>(null)
  const [cashOnCashResult, setCashOnCashResult] = useState<number | null>(null)

  // Handler untuk perubahan form ROI
  const handleRoiFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRoiForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handler untuk perubahan form Cap Rate
  const handleCapRateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCapRateForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handler untuk perubahan form Cash-on-Cash
  const handleCashOnCashFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCashOnCashForm((prev) => ({ ...prev, [name]: value }))
  }

  // Fungsi untuk menghitung ROI
  const calculateROI = () => {
    const propertyPrice = Number.parseFloat(roiForm.propertyPrice) || 0
    const additionalCosts = Number.parseFloat(roiForm.additionalCosts) || 0
    const monthlyRent = Number.parseFloat(roiForm.monthlyRent) || 0
    const propertyTax = Number.parseFloat(roiForm.propertyTax) || 0
    const maintenanceCost = Number.parseFloat(roiForm.maintenanceCost) || 0
    const insurance = Number.parseFloat(roiForm.insurance) || 0
    const investmentPeriod = Number.parseFloat(roiForm.investmentPeriod) || 1
    const sellingPrice = Number.parseFloat(roiForm.sellingPrice) || propertyPrice

    // Total investasi awal
    const totalInvestment = propertyPrice + additionalCosts

    // Pendapatan sewa total
    const totalRentalIncome = monthlyRent * 12 * investmentPeriod

    // Biaya operasional total selama periode sewa
    const totalOperationalCosts = (propertyTax + maintenanceCost + insurance) * investmentPeriod

    // Capital gain (keuntungan dari penjualan)
    const capitalGain = sellingPrice - propertyPrice

    // Keuntungan bersih dari sewa + capital gain
    const netProfit = totalRentalIncome - totalOperationalCosts + capitalGain

    // ROI
    const roi = (netProfit / totalInvestment) * 100

    setRoiResult({
      totalInvestment,
      totalRentalIncome,
      totalOperationalCosts,
      capitalGain,
      roi: roi.toFixed(1),
    })
  }

  // Fungsi untuk menghitung Cap Rate
  const calculateCapRate = () => {
    const propertyPrice = Number.parseFloat(capRateForm.propertyPrice) || 0
    const monthlyRent = Number.parseFloat(capRateForm.monthlyRent) || 0
    const yearlyOperationalCosts = Number.parseFloat(capRateForm.yearlyOperationalCosts) || 0

    const yearlyRent = monthlyRent * 12
    const netOperatingIncome = yearlyRent - yearlyOperationalCosts
    const capRate = (netOperatingIncome / propertyPrice) * 100

    setCapRateResult(Number.parseFloat(capRate.toFixed(1)))
  }

  // Fungsi untuk menghitung Cash-on-Cash Return
  const calculateCashOnCash = () => {
    const cashInvested = Number.parseFloat(cashOnCashForm.cashInvested) || 0
    const monthlyRent = Number.parseFloat(cashOnCashForm.monthlyRent) || 0
    const yearlyOperationalCosts = Number.parseFloat(cashOnCashForm.yearlyOperationalCosts) || 0
    const yearlyMortgagePayment = Number.parseFloat(cashOnCashForm.yearlyMortgagePayment) || 0

    const yearlyRent = monthlyRent * 12
    const annualCashFlow = yearlyRent - yearlyOperationalCosts - yearlyMortgagePayment
    const cashOnCash = (annualCashFlow / cashInvested) * 100

    setCashOnCashResult(Number.parseFloat(cashOnCash.toFixed(1)))
  }

  return (
    <div className="px-3 max-w-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-[#17488D]">ROI Calculator</h2>

      <div className="mb-6">
        <h3 className="text-base font-normal text-black mb-2">Apa yang ingin kamu hitung hari ini?</h3>
        <Tabs value={calculationType} onValueChange={setCalculationType} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger
                value="roi"
                className={`
                text-xs sm:text-sm
                data-[state=active]:bg-[#17488D]
                data-[state=active]:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#17488D]
                focus-visible:ring-offset-1
                transition-colors
                duration-300
                ease-in-out
                `}
            >
                ROI
            </TabsTrigger>
            <TabsTrigger
                value="caprate"
                className={`
                text-xs sm:text-sm
                data-[state=active]:bg-[#17488D]
                data-[state=active]:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#17488D]
                focus-visible:ring-offset-1
                transition-colors
                duration-300
                ease-in-out
                `}
            >
                Cap Rate
            </TabsTrigger>
            <TabsTrigger
                value="cashoncash"
                className={`
                text-xs sm:text-sm
                data-[state=active]:bg-[#17488D]
                data-[state=active]:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#17488D]
                focus-visible:ring-offset-1
                transition-colors
                duration-300
                ease-in-out
                `}
            >
                Cash-on-Cash
            </TabsTrigger>
            </TabsList>

          <TabsContent value="roi" className="space-y-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="propertyPrice">Harga beli properti</Label>
                <Input
                  id="propertyPrice"
                  name="propertyPrice"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.propertyPrice}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="additionalCosts">Biaya tambahan (notaris, renovasi, dll)</Label>
                <Input
                  id="additionalCosts"
                  name="additionalCosts"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.additionalCosts}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="monthlyRent">Pendapatan sewa per bulan</Label>
                <Input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.monthlyRent}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="propertyTax">Pajak properti per tahun</Label>
                <Input
                  id="propertyTax"
                  name="propertyTax"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.propertyTax}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="maintenanceCost">Biaya perawatan per tahun</Label>
                <Input
                  id="maintenanceCost"
                  name="maintenanceCost"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.maintenanceCost}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="insurance">Asuransi per tahun</Label>
                <Input
                  id="insurance"
                  name="insurance"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.insurance}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="investmentPeriod">Periode investasi (tahun)</Label>
                <Input
                  id="investmentPeriod"
                  name="investmentPeriod"
                  type="number"
                  placeholder="Tahun"
                  value={roiForm.investmentPeriod}
                  onChange={handleRoiFormChange}
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Harga jual properti</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  placeholder="Rp"
                  value={roiForm.sellingPrice}
                  onChange={handleRoiFormChange}
                />
              </div>

            <Button
                className="mt-4 bg-[#17488D] text-white border border-[#17488D] rounded-md shadow-sm transition-colors duration-200 hover:bg-blue-100 hover:text-[#17488D] focus:outline-none focus:ring-2 focus:ring-[#17488D] focus:ring-offset-1 py-2 px-4"
                onClick={calculateROI}
                >
                Hitung ROI
            </Button>
            </div>

            {roiResult && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h4 className="font-bold mb-3">Hasil ROI ({roiForm.investmentPeriod} Tahun):</h4>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Total Investasi</td>
                        <td className="py-2 text-right">Rp {roiResult.totalInvestment.toLocaleString("id-ID")}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Pendapatan Sewa</td>
                        <td className="py-2 text-right">Rp {roiResult.totalRentalIncome.toLocaleString("id-ID")}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Biaya Operasional</td>
                        <td className="py-2 text-right">
                          Rp {roiResult.totalOperationalCosts.toLocaleString("id-ID")}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Capital Gain (Jika dijual)</td>
                        <td className="py-2 text-right">Rp {roiResult.capitalGain.toLocaleString("id-ID")}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold">ROI {roiForm.investmentPeriod} Tahun</td>
                        <td className="py-2 text-right font-bold">{roiResult.roi}%</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="caprate" className="space-y-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="capPropertyPrice">Harga beli properti</Label>
                <Input
                  id="capPropertyPrice"
                  name="propertyPrice"
                  type="number"
                  placeholder="Rp"
                  value={capRateForm.propertyPrice}
                  onChange={handleCapRateFormChange}
                />
              </div>

              <div>
                <Label htmlFor="capMonthlyRent">Pendapatan sewa per bulan</Label>
                <Input
                  id="capMonthlyRent"
                  name="monthlyRent"
                  type="number"
                  placeholder="Rp"
                  value={capRateForm.monthlyRent}
                  onChange={handleCapRateFormChange}
                />
              </div>

              <div>
                <Label htmlFor="capYearlyOperationalCosts">Biaya operasional tahunan (pajak, perawatan)</Label>
                <Input
                  id="capYearlyOperationalCosts"
                  name="yearlyOperationalCosts"
                  type="number"
                  placeholder="Rp"
                  value={capRateForm.yearlyOperationalCosts}
                  onChange={handleCapRateFormChange}
                />
              </div>

              {/* <div className="text-xs text-gray-600 mt-1">
                <InfoCircle className="inline-block mr-1 h-4 w-4" />
                Cap Rate cocok untuk mengevaluasi efisiensi properti sewaan.
              </div> */}

            <Button
                className="mt-4 bg-[#17488D] text-white border border-[#17488D] rounded-md shadow-sm transition-colors duration-200 hover:bg-blue-100 hover:text-[#17488D] focus:outline-none focus:ring-2 focus:ring-[#17488D] focus:ring-offset-1 py-2 px-4"
                onClick={calculateCapRate}
                >
                Hitung Cap Rate
            </Button>
            </div>

            {capRateResult !== null && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h4 className="font-bold mb-3">Hasil Cap Rate:</h4>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold">Cap Rate: {capRateResult}%</div>
                  </div>
                  <p className="text-sm">
                    Properti ini menghasilkan ROI bersih {capRateResult}% per tahun dari harga beli.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cashoncash" className="space-y-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="cashInvested">Total uang tunai yang dikeluarkan (misalnya DP)</Label>
                <Input
                  id="cashInvested"
                  name="cashInvested"
                  type="number"
                  placeholder="Rp"
                  value={cashOnCashForm.cashInvested}
                  onChange={handleCashOnCashFormChange}
                />
              </div>

              <div>
                <Label htmlFor="cocMonthlyRent">Pendapatan sewa per bulan</Label>
                <Input
                  id="cocMonthlyRent"
                  name="monthlyRent"
                  type="number"
                  placeholder="Rp"
                  value={cashOnCashForm.monthlyRent}
                  onChange={handleCashOnCashFormChange}
                />
              </div>

              <div>
                <Label htmlFor="cocYearlyOperationalCosts">Biaya operasional per tahun</Label>
                <Input
                  id="cocYearlyOperationalCosts"
                  name="yearlyOperationalCosts"
                  type="number"
                  placeholder="Rp"
                  value={cashOnCashForm.yearlyOperationalCosts}
                  onChange={handleCashOnCashFormChange}
                />
              </div>

              <div>
                <Label htmlFor="yearlyMortgagePayment">Pembayaran cicilan per tahun</Label>
                <Input
                  id="yearlyMortgagePayment"
                  name="yearlyMortgagePayment"
                  type="number"
                  placeholder="Rp"
                  value={cashOnCashForm.yearlyMortgagePayment}
                  onChange={handleCashOnCashFormChange}
                />
              </div>

              {/* <div className="text-xs text-gray-600 mt-1">
                <InfoCircle className="inline-block mr-1 h-4 w-4" />
                Cash-on-Cash Return mengukur seberapa besar pengembalian dari uang tunai yang benar-benar kamu
                keluarkan.
              </div> */}

              <Button className="mt-4 bg-[#17488D] text-white border border-[#17488D] rounded-md shadow-sm transition-colors duration-200 hover:bg-blue-100 hover:text-[#17488D] focus:outline-none focus:ring-2 focus:ring-[#17488D] focus:ring-offset-1 py-2 px-4" onClick={calculateCashOnCash}>
                Hitung Cash-on-Cash Return
              </Button>
            </div>

            {cashOnCashResult !== null && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h4 className="font-bold mb-3">Hasil Cash-on-Cash Return:</h4>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold">Cash-on-Cash Return: {cashOnCashResult}%</div>
                  </div>
                  <p className="text-sm">
                    Berdasarkan uang tunai yang kamu keluarkan, properti ini menghasilkan {cashOnCashResult}% setiap
                    tahun.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
