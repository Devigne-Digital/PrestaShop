/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */
require('module-alias/register');

const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const files = require('@utils/files');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const ImportPage = require('@pages/BO/advancedParameters/import');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_advancedParameters_import_downloadSampleFiles';


let browserContext;
let page;
let filePath;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    importPage: new ImportPage(page),
  };
};

describe('Download import sample csv files', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Login from BO and go to webservice page
  loginCommon.loginBO();

  it('should go to import page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToImportPage', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.advancedParametersLink,
      this.pageObjects.dashboardPage.importLink,
    );

    await this.pageObjects.importPage.closeSfToolBar();

    const pageTitle = await this.pageObjects.importPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.importPage.pageTitle);
  });

  const sampleFiles = [
    {
      args:
        {
          type: 'categories_import',
          textToCheck: 'Category ID;Active (0/1);Name *;Parent category;Root category (0/1);Description;Meta title;'
            + 'Meta keywords;Meta description;URL rewritten;Image URL',
        },
    },
    {
      args:
        {
          type: 'products_import',
          textToCheck: 'Product ID;Active (0/1);Name *;Categories (x,y,z...);Price tax excluded;Tax rules ID;'
            + 'Wholesale price;On sale (0/1);Discount amount;Discount percent;Discount from (yyyy-mm-dd);'
            + 'Discount to (yyyy-mm-dd);Reference #;Supplier reference #;Supplier;Manufacturer;EAN13;UPC;Ecotax;'
            + 'Width;Height;Depth;Weight;Delivery time of in-stock products;'
            + 'Delivery time of out-of-stock products with allowed',
        },
    },
    {
      args:
        {
          type: 'combinations_import',
          textToCheck: 'Product ID*;Attribute (Name:Type:Position)*;Value (Value:Position)*;'
            + 'Supplier reference;Reference;EAN13;UPC;Wholesale price;Impact on price;Ecotax;Quantity;'
            + 'Minimal quantity;Low stock level;Impact on',
        },
    },
    {
      args:
        {
          type: 'customers_import',
          textToCheck: 'Customer ID;Active (0/1);Titles ID (Mr = 1, Ms = 2, else 0);Email *;'
            + 'Password *;Birthday (yyyy-mm-dd);Last Name *;First Name *;Newsletter (0/1);Opt-in (0/1);'
            + 'Registration date (yyyy-mm-dd);Groups',
        },
    },
    {
      args:
        {
          type: 'addresses_import',
          textToCheck: 'Address ID;Alias*;Active (0/1);Customer e-mail*;Customer ID;'
            + 'Manufacturer;Supplier;Company;Lastname*;Firstname*;Address 1*;Address 2;Zipcode*;City*;'
            + 'Country*;State;Other;Phone;Mobile Phone;VAT number;DNI',
        },
    },
    {
      args:
        {
          type: 'manufacturers_import',
          textToCheck: 'Manufacturer ID;Active (0/1);Name *;Description;Short description;'
            + 'Meta title;Meta keywords;Meta description;Image URL',
        },
    },
    {
      args:
        {
          type: 'suppliers_import',
          textToCheck: 'Supplier ID;Active (0/1);Name *;Description;Short description;Meta title;'
            + 'Meta keywords;Meta description;Image URL',
        },
    },
    {
      args:
        {
          type: 'alias_import',
          textToCheck: 'Alias ID;Alias *;Search *;Active (0/1)',
        },
    },
    {
      args:
        {
          type: 'store_contacts',
          textToCheck: 'Store ID;active;name;address1;address2;postcode;state;city;country;latitude;'
            + 'longitude;phone;fax;email;note;hours;image',
        },
    },
  ];

  sampleFiles.forEach((sampleFile) => {
    describe(`Download and check text for ${sampleFile.args.type} sample file`, async () => {
      it(`should download ${sampleFile.args.type} sample file`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${sampleFile.args.type}DownloadFile`, baseContext);

        filePath = await this.pageObjects.importPage.downloadSampleFile(sampleFile.args.type);

        const doesFileExist = await files.doesFileExist(filePath);
        await expect(doesFileExist, `${sampleFile.args.type} sample file was not downloaded`).to.be.true;
      });

      it(`should check ${sampleFile.args.type} sample text file`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', `${sampleFile.args.type}checkTextFile`, baseContext);

        const textExist = await files.isTextInFile(filePath, sampleFile.args.textToCheck);
        await expect(textExist, `Text was not found in ${sampleFile.args.type} sample file`).to.be.true;
      });
    });
  });
});
