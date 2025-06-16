import db from '../configs/db.js'


const chart = async (req,res)=>{
  try {

    const { start_date, end_date, area } = req.query

    // query for grafik
    let grafikQuery = db('report_product')
      .join('store', 'store.store_id', 'report_product.store_id')
      .join('store_area', 'store_area.area_id', 'store.area_id')
      .select('store.area_id', 'store_area.area_name')
      .sum('compliance as total_compliance')
      .count('compliance as total_data')
      .groupBy('store.area_id', 'store_area.area_name')

    // query for table
    let tabelQuery = db('report_product')
      .join('store', 'store.store_id', 'report_product.store_id')
      .join('store_area', 'store_area.area_id', 'store.area_id')
      .join('product', 'product.product_id', 'report_product.product_id')
      .join('product_brand', 'product_brand.brand_id', 'product.brand_id')
      .select(
        'product_brand.brand_name',
        'store_area.area_name'
      )
      .avg({ compliance: 'compliance' })
      .groupBy('product_brand.brand_name', 'store_area.area_name')

   
    grafikQuery = grafikQuery.whereBetween('report_product.tanggal', [start_date, end_date])
    tabelQuery = tabelQuery.whereBetween('report_product.tanggal', [start_date, end_date])

    if (area && area !== '0') {
      grafikQuery = grafikQuery.where('store.area_id', area)
      tabelQuery = tabelQuery.where('store.area_id', area)
    }
    // mapping data for grafik
    const grafikResult = await grafikQuery

    const grafikLabels = []
    const grafikData = []

    grafikResult.forEach(row => {
      const totalCompliance = parseFloat(row.total_compliance)
      const totalData = parseInt(row.total_data)
      const percentage = totalData > 0 ? (totalCompliance / totalData) * 100 : 0

      grafikLabels.push(row.area_name)
      grafikData.push(parseFloat(percentage.toFixed(2)))
    })

    // mapping data for table
    const tabelResult = await tabelQuery

    const areaSet = new Set()
    const brandMap = {}

    tabelResult.forEach(row => {
      const brand = row.brand_name
      const area = row.area_name
      const compliance = parseFloat(row.compliance) * 100

      areaSet.add(area)

      if (!brandMap[brand]) {
        brandMap[brand] = {}
      }

      brandMap[brand][area] = parseFloat(compliance.toFixed(2))
    })

    const tabelLabels = Array.from(areaSet)
    const datasets = Object.keys(brandMap).map(brand => {
      return {
        label: brand,
        data: tabelLabels.map(area => brandMap[brand][area] || 0)
      }
    })

    const data =  {
      grafik: {
        labels: grafikLabels,
        data: grafikData
      },
      tabel: {
        labels: tabelLabels,
        datasets
      }
    }

    res.json({ data})

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
  
}
const getArea = async (req,res) =>{
    try {

        let query = db('store_area').select('*')

        const area = await query


        res.json({area})

  } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
  }
}

export default {chart,getArea}
